import { useState } from "react";
import { Plus, Trash2, ArrowLeft, Image } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
    title: string;
    onAddColumn: () => void;
    onRenameBoard: (newTitle: string) => void;
    onDeleteBoard: () => void;
    onUpdateBackground: (bg: string) => void;
}

// Preset background images
const PRESET_BACKGROUNDS = [
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8MmslMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MmslMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D",
    "https://4kwallpapers.com/images/wallpapers/night-city-city-2560x1440-9753.jpg",
    "https://cdn.wallpapersafari.com/44/41/C9hBOW.jpg"
];

export const BoardHeader = ({ title, onAddColumn, onRenameBoard, onDeleteBoard, onUpdateBackground }: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const handleSave = () => {
        setIsEditing(false);
        if (tempTitle.trim() !== title) onRenameBoard(tempTitle);
    };

    const handleImageSubmit = () => {
        if (imageUrl.trim()) {
            // Create a CSS background string with the image URL
            const bgString = `url(${imageUrl.trim()}) center/cover no-repeat`;
            onUpdateBackground(bgString);
            setImageUrl("");
            setShowImageModal(false);
        }
    };

    const handlePresetClick = (url: string) => {
        const bgString = `url(${url}) center/cover no-repeat`;
        onUpdateBackground(bgString);
        setShowImageModal(false);
    };

    const handleRemoveBackground = () => {
        // Reset to default theme background
        onUpdateBackground("");
        setShowImageModal(false);
    };

    return (
        <>
            <div className="board-header">
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <Link to="/" className="btn-back" style={{ color: "inherit", display: "flex", alignItems: "center", textDecoration: "none" }}>
                        <ArrowLeft size={20} />
                    </Link>
                    {isEditing ? (
                        <input
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleSave}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            style={{ 
                                fontSize: "1.5rem", 
                                fontWeight: "bold", 
                                border: "2px solid var(--primary)", 
                                background: "var(--card-bg)", 
                                color: "var(--text-main)", 
                                padding: "8px 12px", 
                                borderRadius: "10px",
                                outline: "none"
                            }}
                        />
                    ) : (
                        <h1 
                            onClick={() => { setTempTitle(title); setIsEditing(true); }} 
                            style={{ cursor: "pointer", margin: 0, fontSize: "1.5rem" }}
                        >
                            {title}
                        </h1>
                    )}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {/* IMAGE BACKGROUND BUTTON */}
                    <button 
                        onClick={() => setShowImageModal(true)} 
                        className="btn-header"
                        title="Set Background Image"
                    >
                        <Image size={18} />
                    </button>

                    <button onClick={onAddColumn} className="btn-header-add">
                        <Plus size={16} /> Column
                    </button>
                    
                    <button 
                        onClick={onDeleteBoard} 
                        className="btn-header-delete"
                        title="Delete Board"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* IMAGE BACKGROUND MODAL */}
            {showImageModal && (
                <div 
                    className="modal-overlay" 
                    onClick={() => setShowImageModal(false)}
                    style={{ zIndex: 1500 }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "var(--card-bg)",
                            padding: "28px",
                            borderRadius: "12px",
                            maxWidth: "600px",
                            width: "90%",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                            border: "1px solid var(--border-color)"
                        }}
                    >
                        <h2 style={{ 
                            margin: "0 0 24px 0", 
                            fontSize: "20px", 
                            fontWeight: "600",
                            color: "var(--text-main)"
                        }}>
                            Set Background Image
                        </h2>

                        {/* PRESET BACKGROUNDS */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "12px", 
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "var(--text-main)"
                            }}>
                                Choose a Preset
                            </label>
                            <div style={{ 
                                display: "grid", 
                                gridTemplateColumns: "repeat(2, 1fr)", 
                                gap: "12px" 
                            }}>
                                {PRESET_BACKGROUNDS.map((url, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handlePresetClick(url)}
                                        style={{
                                            height: "100px",
                                            borderRadius: "8px",
                                            backgroundImage: `url(${url})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            cursor: "pointer",
                                            border: "2px solid var(--border-color)",
                                            transition: "all 0.2s ease",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.05)";
                                            e.currentTarget.style.borderColor = "var(--primary)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.borderColor = "var(--border-color)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        {/* Hover overlay */}
                                        <div style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: "rgba(0, 0, 0, 0.3)",
                                            opacity: 0,
                                            transition: "opacity 0.2s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "600",
                                            fontSize: "12px"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                                        >
                                            Click to Apply
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DIVIDER */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "20px"
                        }}>
                            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>OR</span>
                            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                        </div>

                        {/* CUSTOM URL INPUT */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "var(--text-muted)"
                            }}>
                                Custom Image URL
                            </label>
                            <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleImageSubmit()}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    background: "var(--bg-page)",
                                    color: "var(--text-main)",
                                    fontFamily: "inherit"
                                }}
                            />
                            <p style={{ 
                                marginTop: "8px", 
                                fontSize: "12px", 
                                color: "var(--text-muted)",
                                margin: "8px 0 0 0"
                            }}>
                                Paste a direct link to an image (JPG, PNG, etc.)
                            </p>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={handleRemoveBackground}
                                className="btn-secondary"
                            >
                                Remove Background
                            </button>
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImageSubmit}
                                className="btn-primary"
                                disabled={!imageUrl.trim()}
                                style={{
                                    opacity: !imageUrl.trim() ? 0.5 : 1,
                                    cursor: !imageUrl.trim() ? "not-allowed" : "pointer"
                                }}
                            >
                                Apply Custom
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};