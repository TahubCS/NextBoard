import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Board from "../models/board";
import Column from "../models/Column";
import Task from "../models/Task";

// --- DEBUG HELPER ---
const log = (msg: string) => console.log(`[Controller] ${msg}`);

// GET /api/board
export const getBoard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        log(`Fetching board for user: ${userId}`);

        let board = await Board.findOne({ user: userId })
        .populate({
            path: "columnOrder",
            populate: { path: "taskIds" } // Load the tasks inside columns
        });

        if (!board) {
        log("No board found, creating new one...");
        // Create defaults
        const col1 = await Column.create({ title: "To Do", taskIds: [] });
        const col2 = await Column.create({ title: "In Progress", taskIds: [] });
        const col3 = await Column.create({ title: "Done", taskIds: [] });

        board = await Board.create({
            user: userId,
            title: "My Project Board",
            columnOrder: [col1._id, col2._id, col3._id]
        });
        
        // Re-fetch to populate
        board = await Board.findById(board._id).populate({
            path: "columnOrder",
            populate: { path: "taskIds" }
        });
        }

        res.status(200).json(board?.columnOrder);
    } catch (error) {
        console.error("Error in getBoard:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// POST /api/columns
export const createColumn = async (req: AuthRequest, res: Response) => {
    try {
        const { boardId } = req.params; // <--- Get Board ID from URL
        const { title } = req.body;

        // 1. Create the Column
        const newColumn = await Column.create({ title, taskIds: [] });

        // 2. Add it to the SPECIFIC Board
        const board = await Board.findOneAndUpdate(
        { _id: boardId, user: req.user?.userId }, // Match ID and Owner
        { $push: { columnOrder: newColumn._id } },
        { new: true }
        );

        if (!board) {
        return res.status(404).json({ message: "Board not found" });
        }

        res.status(201).json(newColumn);
    } catch (error) {
        res.status(500).json({ message: "Error creating column", error });
    }
};

// DELETE /api/columns/:id
export const deleteColumn = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Matches router.delete("/columns/:id")
        log(`Deleting column ID: ${id}`);

        const column = await Column.findById(id);
        if (!column) {
        log("Column not found in DB");
        return res.status(404).json({ message: "Column not found" });
        }

        // 1. Delete all tasks inside this column
        if (column.taskIds.length > 0) {
        await Task.deleteMany({ _id: { $in: column.taskIds } });
        }

        // 2. Remove column ID from the Board
        await Board.findOneAndUpdate(
        { user: req.user?.userId },
        { $pull: { columnOrder: id } }
        );

        // 3. Delete the column itself
        await column.deleteOne();

        log("Column deleted successfully");
        res.status(200).json({ message: "Column deleted" });
    } catch (error) {
        console.error("Error deleteColumn:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// PUT /api/board/reorder
export const moveColumn = async (req: AuthRequest, res: Response) => {
    try {
        const { boardId } = req.params; // <--- Get ID from URL
        const { newColumnOrder } = req.body;

        // Find the SPECIFIC board belonging to this user
        const board = await Board.findOneAndUpdate(
            { _id: boardId, user: req.user?.userId },
            { columnOrder: newColumnOrder },
            { new: true }
        );

        if (!board) return res.status(404).json({ message: "Board not found" });

        res.status(200).json({ message: "Board reordered" });
    } catch (error) {
        res.status(500).json({ message: "Error reordering board", error });
    }
};

// --- TASK LOGIC ---

// POST /api/columns/:id/tasks
export const addTask = async (req: AuthRequest, res: Response) => {
    try {
        // IMPORTANT: We use 'id' to match the route "/columns/:id/tasks"
        const { id } = req.params; 
        const { content } = req.body;

        log(`Adding task to Column ID: ${id}. Content: "${content}"`);

        if (!content) return res.status(400).json({ message: "Content required" });

        // 1. Create Task
        const newTask = await Task.create({ content });

        // 2. Push Task ID into Column
        const updatedColumn = await Column.findByIdAndUpdate(
        id,
        { $push: { taskIds: newTask._id } },
        { new: true }
        );

        if (!updatedColumn) {
        log("Column not found!");
        // Cleanup: delete the orphan task
        await newTask.deleteOne(); 
        return res.status(404).json({ message: "Column not found" });
        }

        log(`Task created with ID: ${newTask._id}`);
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Error addTask:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        log(`Deleting task ID: ${id}`);

        await Task.findByIdAndDelete(id);
        // Remove reference from ANY column
        await Column.updateMany(
        { taskIds: id },
        { $pull: { taskIds: id } }
        );

        res.status(200).json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// PUT /api/tasks/:id
export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // Extract everything from the body
        const { content, description, priority, dueDate } = req.body;

        // Create an update object with only the fields provided
        const updateData: any = {};
        if (content !== undefined) updateData.content = content;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate;

        const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!task) return res.status(404).json({ message: "Task not found" });

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task", error });
    }
};

// PUT /api/tasks/move
// PUT /api/tasks/move
export const moveTask = async (req: AuthRequest, res: Response) => {
    try {
        const { taskId, targetColumnId, newIndex } = req.body;

        log(`Moving task ${taskId} to column ${targetColumnId} at index ${newIndex}`);

        if (!taskId || !targetColumnId || newIndex === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. Remove task from ALL columns first
        await Column.updateMany(
            {},
            { $pull: { taskIds: taskId } }
        );

        // 2. Find the target column
        const column = await Column.findById(targetColumnId);
        if (!column) {
            return res.status(404).json({ message: "Target column not found" });
        }

        // 3. Insert task at the specified index
        // Ensure taskIds is treated as a plain array
        const taskIdsArray = [...column.taskIds];
        taskIdsArray.splice(newIndex, 0, taskId);
        
        // 4. Update the column
        column.taskIds = taskIdsArray as any;
        await column.save();

        log("Task moved successfully");
        res.status(200).json({ message: "Task moved successfully" });
    } catch (error: any) {
        console.error("Move Task Error:", error);
        res.status(500).json({ 
            message: "Server Error moving task", 
            error: error.message 
        });
    }
};

// PUT /api/columns/:id
export const updateColumn = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title) return res.status(400).json({ message: "Title is required" });

        const column = await Column.findByIdAndUpdate(
        id, 
        { title }, 
        { new: true }
        );

        if (!column) return res.status(404).json({ message: "Column not found" });

        res.status(200).json(column);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// GET /api/boards (Dashboard: List all boards)
export const getAllBoards = async (req: AuthRequest, res: Response) => {
    try {
        const boards = await Board.find({ user: req.user?.userId }).select("title _id");
        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ message: "Error fetching boards", error });
    }
};

// GET /api/boards/:id (Single Board View)
export const getBoardById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const board = await Board.findOne({ _id: id, user: req.user?.userId })
        .populate({
            path: "columnOrder",
            populate: { path: "taskIds" }
        });

        if (!board) return res.status(404).json({ message: "Board not found" });

        // We return the whole board object now, not just columns
        // We need the ID and Title for the UI
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ message: "Error fetching board", error });
    }
};

// POST /api/boards (Create New Board)
export const createBoard = async (req: AuthRequest, res: Response) => {
    const { title } = req.body;
    try {
        // Create Default Columns
        const col1 = await Column.create({ title: "To Do", taskIds: [] });
        const col2 = await Column.create({ title: "In Progress", taskIds: [] });
        const col3 = await Column.create({ title: "Done", taskIds: [] });

        const newBoard = await Board.create({
        user: req.user?.userId,
        title: title || "New Board",
        columnOrder: [col1._id, col2._id, col3._id]
        });

        res.status(201).json(newBoard);
    } catch (error) {
        res.status(500).json({ message: "Error creating board", error });
    }
};

// PUT /api/boards/:id
export const updateBoard = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, background } = req.body; // <--- Extract background

    // Build update object dynamically
    const updates: any = {};
    if (title) updates.title = title;
    if (background) updates.background = background; // <--- Add to updates

    try {
        const board = await Board.findOneAndUpdate(
        { _id: id, user: req.user?.userId },
        updates, // <--- Pass the object
        { new: true }
        );
        if (!board) return res.status(404).json({ message: "Board not found" });
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ message: "Error updating board" });
    }
};

// DELETE /api/boards/:id
export const deleteBoard = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const board = await Board.findOne({ _id: id, user: req.user?.userId });
        if (!board) return res.status(404).json({ message: "Board not found" });

        // 1. Find all columns in this board
        const columns = await Column.find({ _id: { $in: board.columnOrder } });
        
        // 2. Extract all Task IDs from those columns
        const taskIds = columns.flatMap(col => col.taskIds);

        // 3. Delete All Tasks
        if (taskIds.length > 0) {
        await Task.deleteMany({ _id: { $in: taskIds } });
        }

        // 4. Delete All Columns
        await Column.deleteMany({ _id: { $in: board.columnOrder } });

        // 5. Delete the Board
        await board.deleteOne();

        res.status(200).json({ message: "Board deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting board", error });
    }
};