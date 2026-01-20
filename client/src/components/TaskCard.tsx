import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, FileText } from "lucide-react"; // Added FileText icon
import type { Task } from "../types";

interface Props {
    task: Task;
    onDelete: (id: string) => void;
    onUpdate: (id: string, content: string) => void;
    onClick: (task: Task) => void; // <--- Ensure this is here
}

export const TaskCard = ({ task, onDelete, onUpdate, onClick }: Props) => {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [content, setContent] = useState(task.content);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task._id,
        data: {
        type: "Task",
        task,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.3 : 1,
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
        setMouseIsOver(false);
    };

    const saveTask = () => {
        setEditMode(false);
        if (content !== task.content) {
            onUpdate(task._id, content);
        }
    };

    if (editMode) {
        return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="task-card"
        >
            <textarea
            className="task-textarea"
            value={content}
            autoFocus
            placeholder="Task content here"
            onBlur={saveTask}
            onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey) {
                toggleEditMode();
                }
            }}
            onChange={(e) => setContent(e.target.value)}
            />
        </div>
        );
    }

    return (
        <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="task-card"
        onMouseEnter={() => setMouseIsOver(true)}
        onMouseLeave={() => setMouseIsOver(false)}
        onClick={() => onClick(task)} // Opens the modal
        >
        {/* 1. Main Content */}
        <p style={{ margin: 0, fontWeight: 500, lineHeight: "1.4" }}>
            {task.content}
        </p>

        {/* 2. Description Preview (NEW) */}
        {task.description && (
            <div style={{ 
                fontSize: "12px", 
                color: "#5e6c84", 
                marginTop: "8px",
                // Limit to 2 lines and add "..." if too long
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                // Add a subtle background to separate it
                background: "#fafbfc",
                padding: "4px",
                borderRadius: "4px",
                border: "1px dashed #dfe1e6"
            }}>
                {/* Tiny Icon to indicate description */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px", color: "#172b4d", fontWeight: 600 }}>
                    <FileText size={10} /> Description:
                </div>
                {task.description}
            </div>
        )}

        {/* 3. Badges (Priority & Date) */}
        <div style={{ display: "flex", gap: "5px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {task.priority === "High" && (
            <span style={{ fontSize: "10px", background: "#ffebe6", color: "#bf2600", padding: "2px 6px", borderRadius: "3px", fontWeight: "bold" }}>HIGH</span>
            )}
            {task.priority === "Medium" && (
            <span style={{ fontSize: "10px", background: "#fffae6", color: "#ff991f", padding: "2px 6px", borderRadius: "3px", fontWeight: "bold" }}>MED</span>
            )}
            {task.dueDate && (
            <span style={{ fontSize: "10px", background: "#eae6ff", color: "#403294", padding: "2px 6px", borderRadius: "3px" }}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
            )}
        </div>

        {/* Delete Button (Hover) */}
        {mouseIsOver && (
            <button
            onClick={(e) => {
                e.stopPropagation(); // Don't open modal
                onDelete(task._id);
            }}
            className="btn-delete-task"
            >
            <Trash2 size={16} />
            </button>
        )}
        </div>
    );
};