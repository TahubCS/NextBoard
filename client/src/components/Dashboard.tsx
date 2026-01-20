import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/boardApi"; // Use api instead of axios
import { ArrowRight, Layout, Plus } from "lucide-react";
import { Modal } from "./Modal";
import toast from "react-hot-toast";

interface BoardSummary {
    background: any;
    _id: string;
    title: string;
}

export const Dashboard = () => {
    const [boards, setBoards] = useState<BoardSummary[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user's boards - using api instead of axios
        api.get("/boards").then((res) => setBoards(res.data));
    }, []);

    const handleCreateConfirm = async () => {
        if (!newBoardTitle.trim()) return toast.error("Title is required");

        try {
            const res = await api.post("/boards", { title: newBoardTitle });
            navigate(`/board/${res.data._id}`);
            toast.success("Board created!");
        } catch (error) {
            toast.error("Failed to create board");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>My Boards</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-create-board">
                    <Plus size={16} /> Create New Board
                </button>
            </div>

            <div className="board-grid">
                {boards.map((board, index) => (
                    <Link key={board._id} to={`/board/${board._id}`} className="board-card animate-item" style={{
                        animationDelay: `${100 + (index * 50)}ms`,
                        background: board.background && board.background.includes('url') 
                            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), ${board.background}`
                            : board.background || 'var(--board-card-bg)',
                        
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: board.background && (board.background.includes('url') || board.background.includes('linear-gradient')) 
                            ? 'white' 
                            : 'var(--text-main)',
                            
                        border: board.background && board.background.includes('url') ? 'none' : '1px solid var(--border-light)',
                        
                        textShadow: board.background && board.background.includes('url') ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                    }}>
                        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Layout 
                                size={20} 
                                style={{ 
                                    opacity: 0.8,
                                    color: board.background && board.background.includes('url') ? 'white' : 'var(--primary)' 
                                }} 
                            />
                            
                            <h3 style={{ 
                                fontSize: '1.15rem', 
                                fontWeight: 600,
                                color: 'inherit',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {board.title}
                            </h3>
                        </div>
                        
                        <div style={{ 
                            alignSelf: "flex-end", 
                            opacity: 0.6,
                            transition: 'transform 0.2s ease, opacity 0.2s ease'
                        }}>
                            <ArrowRight size={20} />
                        </div>
                    </Link>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Board"
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleCreateConfirm}>
                            Create
                        </button>
                    </>
                }
            >
                <p style={{ marginBottom: "10px", color: "#6b778c" }}>
                    Give your board a name to get started.
                </p>
                <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Project Alpha"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateConfirm()}
                    style={{
                        width: "100%",
                        padding: "10px",
                        border: "2px solid #dfe1e6",
                        borderRadius: "4px",
                        fontSize: "16px"
                    }}
                />
            </Modal>
        </div>
    );
};