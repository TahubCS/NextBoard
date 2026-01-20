import { useState } from "react";
import { Plus, X } from "lucide-react";

interface Props {
    onAdd: (title: string) => void;
}

export const AddColumn = ({ onAdd }: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title);
        setTitle("");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
        <div className="column add-column-form">
            <form onSubmit={handleSubmit}>
                <input
                    autoFocus
                    className="add-column-input"
                    placeholder="Column Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="add-task-actions" style={{ marginTop: '10px' }}>
                    <button type="submit" className="btn-add">
                        Add Column
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                        <X size={20} />
                    </button>
                </div>
            </form>
        </div>
        );
    }

    return (
        <button onClick={() => setIsEditing(true)} className="btn-add-column">
            <Plus size={20} /> Add Another Column
        </button>
    );
};