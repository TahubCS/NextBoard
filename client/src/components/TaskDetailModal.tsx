import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import type { Task } from "../types";
import { Trash2, Calendar, Flag } from "lucide-react";

interface Props {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
}

export const TaskDetailModal = ({ task, isOpen, onClose, onUpdate, onDelete }: Props) => {
    const [content, setContent] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");
    const [dueDate, setDueDate] = useState("");

    // Load task data when it opens
    useEffect(() => {
        if (task) {
        setContent(task.content);
        setDescription(task.description || "");
        setPriority(task.priority || "Low");
        // Format date for input (YYYY-MM-DD)
        setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
        }
    }, [task]);

    const handleSave = () => {
        if (!task) return;
        onUpdate(task._id, { content, description, priority, dueDate });
        onClose();
    };

    const handleDelete = () => {
        if (!task) return;
        if (window.confirm("Delete this task?")) {
        onDelete(task._id);
        onClose();
        }
    };

    if (!task) return null;

    return (
        <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Task"
        footer={
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <button 
                onClick={handleDelete}
                style={{ 
                background: "none", border: "none", color: "#bf2600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" 
                }}
            >
                <Trash2 size={16} /> Delete
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
            </div>
        }
        >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            
            {/* Title Input */}
            <div>
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", color: "#5e6c84"}}>Title</label>
            <input 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #dfe1e6" }}
            />
            </div>

            {/* Priority & Due Date Row */}
            <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
                <label style={{display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px", fontWeight: "bold", color: "#5e6c84"}}>
                <Flag size={14} /> Priority
                </label>
                <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #dfe1e6" }}
                >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                </select>
            </div>

            <div style={{ flex: 1 }}>
                <label style={{display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px", fontWeight: "bold", color: "#5e6c84"}}>
                <Calendar size={14} /> Due Date
                </label>
                <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #dfe1e6" }}
                />
            </div>
            </div>

            {/* Description */}
            <div>
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold", color: "#5e6c84"}}>Description</label>
            <textarea 
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #dfe1e6", resize: "vertical" }}
            />
            </div>

        </div>
        </Modal>
    );
};