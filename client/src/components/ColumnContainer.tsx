import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Column, Task } from "../types"; // Import Task
import { AddTask } from "./AddTask";
import { addTask } from "../api/boardApi";
import { TaskCard } from "./TaskCard";

interface Props {
    column: Column;
    onTaskAdded: (newTask: Task, columnId: string) => void;
    onTaskDeleted: (taskId: string) => void;
    onTaskUpdated: (taskId: string, content: string) => void;
    onColumnDeleted: (columnId: string) => void;
    onColumnUpdated: (columnId: string, title: string) => void;
    onTaskClick: (task: Task) => void; // <--- ADD THIS LINE
}

export const ColumnContainer = ({ 
    column, 
    onTaskAdded, 
    onTaskDeleted, 
    onTaskUpdated, 
    onColumnDeleted,
    onColumnUpdated,
    onTaskClick // <--- DESTRUCTURE THIS
    }: Props) => {
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState(column.title);

    const taskIds = useMemo(() => column.taskIds.map((t) => t._id), [column.taskIds]);

    const { 
        setNodeRef, 
        attributes, 
        listeners, 
        transform, 
        transition, 
        isDragging 
    } = useSortable({
        id: column._id,
        data: {
        type: "Column",
        column,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const handleAdd = async (content: string) => {
        try {
        const newTask = await addTask(column._id, content);
        onTaskAdded(newTask, column._id);
        } catch (error) {
        console.error("Failed to add task", error);
        }
    };

    const saveTitle = () => {
        setEditMode(false);
        if (title.trim() !== column.title) {
        onColumnUpdated(column._id, title);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="column">
        <div 
            {...attributes}
            {...listeners}
            className="column-header"
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1 }}>
            <span className="task-count">{column.taskIds.length}</span>
            {editMode ? (
                <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                onBlur={saveTitle}
                onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                }}
                style={{
                    background: "white",
                    border: "2px solid #0079bf",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "1.17em",
                    fontWeight: "bold",
                    width: "100%"
                }}
                />
            ) : (
                <h3 
                onClick={() => setEditMode(true)}
                style={{ cursor: "pointer", margin: 0 }}
                >
                {column.title}
                </h3>
            )}
            </div>
            
            <button 
            onClick={(e) => {
                e.stopPropagation();
                onColumnDeleted(column._id);
            }}
            className="btn-delete-column"
            onPointerDown={(e) => e.stopPropagation()}
            >
            <Trash2 size={18} />
            </button>
        </div>

        <div className="task-list">
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {column.taskIds.map((task) => (
                <TaskCard 
                key={task._id} 
                task={task} 
                onDelete={onTaskDeleted}
                onUpdate={onTaskUpdated}
                onClick={onTaskClick} // <--- PASS IT DOWN HERE
                />
            ))}
            </SortableContext>
        </div>

        <AddTask onAdd={handleAdd} />
        </div>
    );
};