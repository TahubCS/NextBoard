import { useState } from "react";
import { Plus, X } from "lucide-react"; // Icons for nice UI

interface Props {
    onAdd: (content: string) => void;
}

export const AddTask = ({ onAdd }: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onAdd(content);
        setContent("");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
        <form onSubmit={handleSubmit} className="add-task-form">
            <input
            autoFocus
            type="text"
            placeholder="What needs to be done?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="add-task-input"
            />
            <div className="add-task-actions">
            <button type="submit" className="btn-add">Add</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                <X size={20} />
            </button>
            </div>
        </form>
        );
    }

    return (
        <button onClick={() => setIsEditing(true)} className="btn-show-add">
        <Plus size={20} /> Add Task
        </button>
    );
};