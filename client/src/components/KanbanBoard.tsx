import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Moon, Sun, LogOut } from "lucide-react";
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
import { useAuth } from "../context/AuthContext";
import NextBoard from "../assets/NextBoard.svg";

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
    const { logout, userName } = useAuth();

    // Theme Logic
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark";
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

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
            if (boardElement.scrollWidth > boardElement.clientWidth) {
                e.preventDefault();
                boardElement.scrollLeft += e.deltaY;
            }
        };
        
        boardElement.addEventListener('wheel', handleWheel as EventListener, { passive: false });
        
        return () => {
            boardElement.removeEventListener('wheel', handleWheel as EventListener);
        };
    }, [columns]);

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
        
        setBoardBackground(newBg);
        
        try {
            await updateBoardBackground(boardId, newBg);
            toast.success('Background updated!');
        } catch (error) {
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

            {/* BOARD NAVBAR - FIXED */}
            <nav 
                style={{
                    position: "sticky",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    padding: "16px 5%",
                    background: "rgba(255, 255, 255, 0.1)", // REDUCED from 0.15
                    backdropFilter: "blur(20px)", // REDUCED from 100px
                    WebkitBackdropFilter: "blur(20px)", // REDUCED from 100px
                    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.3s ease"
                }}
            >
                <div style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    {/* LOGO */}
                    <div 
                        onClick={() => navigate("/")}
                        style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "12px", 
                            cursor: "pointer" 
                        }}
                    >
                        <img 
                            src={NextBoard} 
                            alt="NextBoard Logo" 
                            style={{ 
                                width: "40px", 
                                height: "40px",
                                filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))"
                            }}
                        />
                        <span style={{ 
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            letterSpacing: "-0.5px",
                            textShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                        }}>
                            NextBoard
                        </span>
                    </div>
                    
                    {/* RIGHT SIDE ACTIONS */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            style={{ 
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                border: "1px solid white",
                                color: "white",
                                padding: "10px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "42px",
                                height: "42px",
                                transition: "all 0.3s ease"
                            }}
                            title="Toggle Theme"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "rotate(15deg) scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "none";
                            }}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <span 
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.9)",
                                textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
                            }}
                        >
                            Welcome, <strong style={{ 
                                color: "white",
                                textTransform: "capitalize"
                            }}>{userName}</strong>
                        </span>
                        
                        <button 
                            onClick={logout}
                            style={{ 
                                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)",
                                color: "white",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                padding: "10px 24px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "14px",
                                transition: "all 0.3s ease",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <LogOut size={16} /> <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

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