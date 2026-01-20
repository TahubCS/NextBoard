import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
    DndContext,
    DragOverlay,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
    useSensor,
    useSensors,
    TouchSensor,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import type { Column, Task } from "../types";
import { 
    fetchBoard, 
    moveTask, 
    moveColumn, 
    createColumn, 
    deleteColumn,
    deleteTask,
    updateTaskContent,
    updateColumnTitle,
    updateBoardTitle,
    deleteBoard,
    updateBoardBackground
} from "../api/boardApi";
import { ColumnContainer } from "./ColumnContainer";
import { TaskCard } from "./TaskCard";
import { BoardHeader } from "./BoardHeader";
import { Modal } from "./Modal";
import { TaskDetailModal } from "./TaskDetailModal";

export const KanbanBoard = () => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [boardTitle, setBoardTitle] = useState("Loading...");
    const [boardBackground, setBoardBackground] = useState<string>("");
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const { boardId } = useParams();
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, 
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // --- DATA FETCHING ---
    useEffect(() => {
        if (boardId) {
            const loadingToast = toast.loading('Loading board...');
            
            fetchBoard(boardId).then((data: any) => {
                setBoardTitle(data.title);
                
                // Set background if it exists
                if (data.background) {
                    setBoardBackground(data.background);
                }
                    
                if (data.columnOrder) {
                    setColumns(data.columnOrder);
                } else if (Array.isArray(data)) {
                    setColumns(data);
                } else {
                    setColumns([]);
                }
                
                toast.dismiss(loadingToast);
            })
            .catch((err) => {
                console.error("Fetch Error:", err);
                toast.error('Failed to load board', { id: loadingToast });
            });
        }
    }, [boardId]);

    useEffect(() => {
        const boardElement = document.querySelector('.board');
        
        if (!boardElement) return;
        
        const handleWheel = (e: WheelEvent) => {
            // Only apply horizontal scroll if there's actual horizontal overflow
            if (boardElement.scrollWidth > boardElement.clientWidth) {
                // Prevent default vertical scroll
                e.preventDefault();
                
                // Scroll horizontally instead
                // deltaY is the vertical scroll amount from the mouse wheel
                boardElement.scrollLeft += e.deltaY;
            }
        };
        
        // Add the wheel event listener
        boardElement.addEventListener('wheel', handleWheel as EventListener, { passive: false });
        
        // Cleanup on unmount
        return () => {
            boardElement.removeEventListener('wheel', handleWheel as EventListener);
        };
    }, [columns]); // Re-run when columns change

    const columnIds = useMemo(() => columns.map((col) => col._id), [columns]);

    // --- COLUMN HANDLERS ---
    const handleAddColumn = async (title: string) => {
        if (!boardId) return;
        const loadingToast = toast.loading('Creating column...');
        
        try {
            const newColumn = await createColumn(title, boardId);
            setColumns([...columns, newColumn]);
            toast.success(`Column "${title}" created!`, { id: loadingToast });
        } catch (error) {
            console.error("Failed to create column", error);
            toast.error('Failed to create column', { id: loadingToast });
        }
    };

    const requestAddColumn = () => {
        setNewColumnTitle(""); 
        setIsColumnModalOpen(true);
    };

    const confirmAddColumn = () => {
        if (newColumnTitle.trim()) {
            handleAddColumn(newColumnTitle);
            setIsColumnModalOpen(false);
        } else {
            toast.error("Title cannot be empty");
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        const confirm = window.confirm("Are you sure you want to delete this column?");
        if (!confirm) return;

        const previousColumns = [...columns];
        setColumns((cols) => cols.filter((col) => col._id !== columnId));
        const loadingToast = toast.loading('Deleting column...');

        try {
            await deleteColumn(columnId);
            toast.success(`Column deleted!`, { id: loadingToast });
        } catch (error) {
            setColumns(previousColumns);
            toast.error('Failed to delete column', { id: loadingToast });
        }
    };

    const handleUpdateColumn = async (columnId: string, newTitle: string) => {
        const oldTitle = columns.find(col => col._id === columnId)?.title;
        setColumns((cols) =>
            cols.map((col) => 
                col._id === columnId ? { ...col, title: newTitle } : col
            )
        );

        try {
            await updateColumnTitle(columnId, newTitle);
            toast.success(`Column renamed`);
        } catch (error) {
            setColumns((cols) =>
                cols.map((col) => 
                    col._id === columnId ? { ...col, title: oldTitle || col.title } : col
                )
            );
            toast.error('Failed to rename column');
        }
    };

    // --- TASK HANDLERS ---
    const handleTaskAdded = (newTask: Task, columnId: string) => {
        setColumns((cols) =>
            cols.map((col) =>
                col._id === columnId ? { ...col, taskIds: [...col.taskIds, newTask] } : col
            )
        );
        toast.success('Task created!');
    };

    const handleDeleteTask = async (taskId: string) => {
        const previousColumns = [...columns];
        setColumns((cols) =>
            cols.map((col) => ({
                ...col,
                taskIds: col.taskIds.filter((t) => t._id !== taskId),
            }))
        );

        try {
            await deleteTask(taskId);
            toast.success('Task deleted!');
        } catch (error) {
            setColumns(previousColumns);
            toast.error('Failed to delete task');
        }
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        setColumns((cols) =>
            cols.map((col) => ({
                ...col,
                taskIds: col.taskIds.map((t) =>
                    t._id === taskId ? { ...t, ...updates } : t
                ),
            }))
        );

        try {
            await updateTaskContent(taskId, updates);
        } catch (error) {
            toast.error("Failed to update task");
        }
    };

    const handleUpdateTaskContent = async (taskId: string, content: string) => {
        await handleUpdateTask(taskId, { content });
    };

    // --- BOARD HANDLERS ---
    const handleUpdateBackground = async (newBg: string) => {
        if (!boardId) return;
        
        // Optimistic update
        setBoardBackground(newBg);
        
        try {
            await updateBoardBackground(boardId, newBg);
            toast.success('Background updated!');
        } catch (error) {
            // Revert on error
            setBoardBackground(boardBackground);
            toast.error("Failed to save background");
        }
    };

    const handleRenameBoard = async (newTitle: string) => {
        if (!boardId) return;
        const oldTitle = boardTitle;
        setBoardTitle(newTitle);
        
        try {
            await updateBoardTitle(boardId, newTitle);
            toast.success(`Board renamed`);
        } catch (error) {
            setBoardTitle(oldTitle);
            toast.error('Failed to rename board');
        }
    };

    const handleDeleteBoard = async () => {
        if (!boardId) return;
        const confirm = window.confirm("Are you sure? This will delete all columns and tasks permanently.");
        if (!confirm) return;

        const loadingToast = toast.loading('Deleting board...');

        try {
            await deleteBoard(boardId);
            toast.success('Board deleted!', { id: loadingToast });
            navigate("/");
        } catch (error) {
            toast.error('Failed to delete board', { id: loadingToast });
        }
    };

    // --- DRAG HANDLERS ---
    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        const activeColumn = columns.find((col) => col.taskIds.some((t) => t._id === activeId));
        const overColumn = columns.find((col) => col._id === overId || col.taskIds.some((t) => t._id === overId));

        if (!activeColumn || !overColumn) return;

        if (activeColumn._id !== overColumn._id) {
            setColumns((prev) => {
                const activeColIndex = prev.findIndex((col) => col._id === activeColumn._id);
                const overColIndex = prev.findIndex((col) => col._id === overColumn._id);

                const activeTaskIndex = prev[activeColIndex].taskIds.findIndex((t) => t._id === activeId);
                const overTaskIndex = isOverTask
                    ? prev[overColIndex].taskIds.findIndex((t) => t._id === overId)
                    : prev[overColIndex].taskIds.length;

                const newActiveTasks = [...prev[activeColIndex].taskIds];
                const newOverTasks = [...prev[overColIndex].taskIds];
                
                const [movedTask] = newActiveTasks.splice(activeTaskIndex, 1);
                
                if (overTaskIndex >= 0) {
                    newOverTasks.splice(overTaskIndex, 0, movedTask);
                } else {
                    newOverTasks.push(movedTask);
                }

                const newColumns = [...prev];
                newColumns[activeColIndex] = { ...prev[activeColIndex], taskIds: newActiveTasks };
                newColumns[overColIndex] = { ...prev[overColIndex], taskIds: newOverTasks };

                return newColumns;
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // COLUMN SORTING
        if (active.data.current?.type === "Column") {
            setColumns((columns) => {
                const oldIndex = columns.findIndex((col) => col._id === activeId);
                const newIndex = columns.findIndex((col) => col._id === overId);
                
                const newColumns = arrayMove(columns, oldIndex, newIndex);
                const newOrderIds = newColumns.map(c => c._id);
                
                if (boardId) {
                    moveColumn(boardId, newOrderIds).catch((err) => {
                        console.error("Move column error:", err);
                        toast.error('Failed to reorder column');
                    });
                }
                return newColumns;
            });
            return;
        }

        // TASK SORTING
        const activeColumn = columns.find((col) => col.taskIds.some((t) => t._id === activeId));
        const overColumn = columns.find((col) => col._id === overId || col.taskIds.some((t) => t._id === overId));

        if (activeColumn && overColumn && activeColumn._id === overColumn._id) {
            const activeIndex = activeColumn.taskIds.findIndex((t) => t._id === activeId);
            const overIndex = activeColumn.taskIds.findIndex((t) => t._id === overId);

            if (activeIndex !== overIndex) {
                setColumns((prev) => prev.map(col => {
                    if (col._id === activeColumn._id) {
                        return { ...col, taskIds: arrayMove(col.taskIds, activeIndex, overIndex) };
                    }
                    return col;
                }));
                
                moveTask(activeId as string, activeColumn._id, overIndex).catch(() => {
                    toast.error('Failed to move task');
                });
            }
        } else if (activeColumn && overColumn && activeColumn._id !== overColumn._id) {
            const newIndex = overColumn.taskIds.findIndex((t) => t._id === activeId);
            moveTask(activeId as string, overColumn._id, newIndex).catch(() => {
                toast.error('Failed to move task');
            });
        }
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div 
                    className="app-layout" 
                    style={{ 
                        background: boardBackground || 'var(--bg-gradient)'
                    }}
                >
                    <BoardHeader 
                        title={boardTitle}
                        onAddColumn={requestAddColumn} 
                        onRenameBoard={handleRenameBoard}
                        onDeleteBoard={handleDeleteBoard}
                        onUpdateBackground={handleUpdateBackground}
                    />

                    <div className="board">
                        <SortableContext items={columnIds} strategy={rectSortingStrategy}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col._id}
                                    column={col}
                                    onTaskAdded={handleTaskAdded}
                                    onTaskDeleted={handleDeleteTask}
                                    onTaskUpdated={handleUpdateTaskContent}
                                    onColumnDeleted={handleDeleteColumn}
                                    onColumnUpdated={handleUpdateColumn}
                                    onTaskClick={setSelectedTask}
                                />
                            ))}
                        </SortableContext>
                    </div>
                </div>

                <DragOverlay>
                    {activeColumn ? (
                        <ColumnContainer
                            column={activeColumn}
                            onTaskAdded={() => {}}
                            onTaskDeleted={() => {}}
                            onTaskUpdated={() => {}}
                            onColumnDeleted={() => {}}
                            onColumnUpdated={() => {}}
                            onTaskClick={() => {}}
                        />
                    ) : null}
                    {activeTask ? (
                        <TaskCard 
                            task={activeTask} 
                            onDelete={() => {}} 
                            onUpdate={() => {}} 
                            onClick={() => {}} 
                        />
                    ) : null}
                </DragOverlay>

                {/* --- MODALS --- */}
                <Modal
                    isOpen={isColumnModalOpen}
                    onClose={() => setIsColumnModalOpen(false)}
                    title="Add New Column"
                    footer={
                    <>
                        <button className="btn-secondary" onClick={() => setIsColumnModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={confirmAddColumn}>
                            Add Column
                        </button>
                    </>
                    }
                >
                    <input
                        autoFocus
                        type="text"
                        placeholder="e.g. In Review, Testing..."
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmAddColumn()}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "2px solid #dfe1e6",
                            borderRadius: "4px",
                            fontSize: "16px"
                        }}
                    />
                </Modal>

                <TaskDetailModal
                    isOpen={!!selectedTask}
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            </DndContext>
        </>
    );
};