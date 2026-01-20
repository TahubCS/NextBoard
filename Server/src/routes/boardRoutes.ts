import express from "express";
import { auth } from "../middleware/auth";
import { 
    getAllBoards,     // <--- Make sure these are imported
    getBoardById,     // <--- THIS IS CRITICAL
    createBoard,
    createColumn, 
    moveColumn, 
    deleteColumn,
    addTask, 
    deleteTask, 
    updateTask, 
    moveTask,
    updateColumn,
    deleteBoard,
    updateBoard,
} from "../controllers/boardController";

const router = express.Router();

// --- DASHBOARD ROUTES ---
router.get("/boards", auth, getAllBoards);        // List all
router.post("/boards", auth, createBoard);        // Create new
router.get("/boards/:id", auth, getBoardById);    // <--- THIS ROUTE MUST EXIST

// --- COLUMN ROUTES ---
// Note: We updated this to be board-aware
router.post("/boards/:boardId/columns", auth, createColumn); 
router.delete("/columns/:id", auth, deleteColumn);
router.put("/columns/:id", auth, updateColumn);

// --- BOARD REORDER ---
router.put("/boards/:boardId/reorder", auth, moveColumn);   
router.put("/boards/:id", auth, updateBoard);
router.delete("/boards/:id", auth, deleteBoard);

// --- TASK ROUTES ---
router.post("/columns/:id/tasks", auth, addTask);
router.put("/tasks/move", auth, moveTask);        // ✅ MOVE THIS LINE UP
router.put("/tasks/:id", auth, updateTask);       // ✅ AFTER move route
router.delete("/tasks/:id", auth, deleteTask);

export default router;