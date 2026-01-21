import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/boardApi";
import { ArrowRight, Layout, Plus, Sparkles, Moon, Sun, LogOut } from "lucide-react";
import { Modal } from "./Modal";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import NextBoard from "../assets/NextBoard.svg";

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

    useEffect(() => {
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
        <>
            {/* DASHBOARD NAVBAR - FIXED */}
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

            {/* DASHBOARD CONTENT */}
            <div 
                className="dashboard-wrapper"
                style={{
                    minHeight: "calc(100vh - 60px)",
                    background: "var(--dashboard-gradient, linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%))",
                    position: "relative",
                    overflow: "hidden",
                    padding: "60px 5% 80px"
                }}
            >
                {/* Animated floating background elements */}
                <div className="dashboard-blob-1" style={{
                    position: 'fixed',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
                    top: '-200px',
                    right: '-100px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(80px)',
                    animation: 'dashboardFloat1 20s ease-in-out infinite'
                }} />
                
                <div className="dashboard-blob-2" style={{
                    position: 'fixed',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
                    bottom: '-150px',
                    left: '-100px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(80px)',
                    animation: 'dashboardFloat2 18s ease-in-out infinite'
                }} />

                <div className="dashboard-blob-3" style={{
                    position: 'fixed',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(90px)',
                    animation: 'dashboardFloat3 25s ease-in-out infinite'
                }} />

                {/* Floating particles */}
                <div className="particle particle-1" style={{
                    position: 'fixed',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    opacity: 0.3,
                    top: '20%',
                    left: '15%',
                    animation: 'particleFloat 15s ease-in-out infinite'
                }} />
                <div className="particle particle-2" style={{
                    position: 'fixed',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    opacity: 0.2,
                    top: '60%',
                    right: '20%',
                    animation: 'particleFloat 12s ease-in-out infinite 2s'
                }} />
                <div className="particle particle-3" style={{
                    position: 'fixed',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#764ba2',
                    opacity: 0.25,
                    bottom: '30%',
                    left: '25%',
                    animation: 'particleFloat 18s ease-in-out infinite 4s'
                }} />

                <div style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    position: "relative",
                    zIndex: 1
                }}>
                    {/* Header Section */}
                    <div className="dashboard-header-glass" style={{
                        background: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
                        backdropFilter: "blur(20px)",
                        borderRadius: "20px",
                        padding: "32px 40px",
                        border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.5))",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                        marginBottom: "40px",
                        animation: "slideInDown 0.6s ease-out",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                            animation: "gradientShift 8s ease infinite",
                            pointerEvents: "none"
                        }} />

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            position: "relative",
                            zIndex: 1
                        }}>
                            <div>
                                <h1 style={{
                                    fontSize: "32px",
                                    fontWeight: 800,
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    margin: 0,
                                    letterSpacing: "-0.5px",
                                    marginBottom: "8px"
                                }}>
                                    My Boards
                                </h1>
                                <p style={{
                                    color: "var(--text-muted)",
                                    fontSize: "14px",
                                    margin: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}>
                                    <Sparkles size={14} /> 
                                    {boards.length} {boards.length === 1 ? 'board' : 'boards'} ready to organize your work
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="btn-create-board-fancy"
                                style={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    border: "none",
                                    padding: "14px 28px",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: "15px",
                                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                                    transition: "all 0.3s ease",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(102, 126, 234, 0.5)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(102, 126, 234, 0.4)";
                                }}
                            >
                                <div style={{
                                    position: "absolute",
                                    top: 0,
                                    left: "-100%",
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                    animation: "buttonShine 3s infinite"
                                }} />
                                <Plus size={18} /> Create New Board
                            </button>
                        </div>
                    </div>

                    {/* Board Grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "24px",
                        width: "100%"
                    }}>
                        {boards.map((board, index) => (
                            <div
                                key={board._id} 
                                onClick={() => navigate(`/board/${board._id}`)}
                                className="board-card-premium"
                                style={{
                                    background: board.background && board.background.includes('url') 
                                        ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), ${board.background}`
                                        : 'var(--card-glass-bg, rgba(255, 255, 255, 0.7))',
                                    
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    
                                    backdropFilter: board.background && board.background.includes('url') ? 'none' : 'blur(16px)',
                                    
                                    border: board.background && board.background.includes('url') 
                                        ? 'none' 
                                        : '1px solid var(--card-glass-border, rgba(255, 255, 255, 0.4))',
                                    
                                    height: "140px",
                                    padding: "24px",
                                    borderRadius: "20px",
                                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                                    textDecoration: "none",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                    position: "relative",
                                    overflow: "hidden",
                                    animationDelay: `${index * 80}ms`,
                                    animation: "cardSlideUp 0.6s ease-out backwards",
                                    cursor: "pointer"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
                                }}
                            >
                                {!board.background?.includes('url') && (
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
                                        pointerEvents: "none",
                                        borderRadius: "20px",
                                        animation: "gradientPulse 6s ease-in-out infinite"
                                    }} />
                                )}

                                <div className="card-shimmer" style={{
                                    position: "absolute",
                                    top: "-50%",
                                    left: "-50%",
                                    width: "200%",
                                    height: "200%",
                                    background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                                    transform: "rotate(45deg)",
                                    pointerEvents: "none",
                                    opacity: 0,
                                    transition: "opacity 0.6s"
                                }} />

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '14px',
                                    position: "relative",
                                    zIndex: 1
                                }}>
                                    <div style={{
                                        background: board.background && board.background.includes('url')
                                            ? 'rgba(255, 255, 255, 0.2)'
                                            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <Layout 
                                            size={22} 
                                            style={{ 
                                                color: board.background && board.background.includes('url') 
                                                    ? 'white' 
                                                    : 'var(--primary)' 
                                            }} 
                                        />
                                    </div>
                                    
                                    <h3 style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: 700,
                                        color: board.background && board.background.includes('url') 
                                            ? 'white' 
                                            : 'var(--text-main)',
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        textShadow: board.background && board.background.includes('url') 
                                            ? '0 2px 8px rgba(0,0,0,0.5)' 
                                            : 'none',
                                        flex: 1
                                    }}>
                                        {board.title}
                                    </h3>
                                </div>
                                
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    position: "relative",
                                    zIndex: 1
                                }}>
                                    <span style={{
                                        fontSize: '12px',
                                        color: board.background && board.background.includes('url')
                                            ? 'rgba(255, 255, 255, 0.8)'
                                            : 'var(--text-muted)',
                                        fontWeight: 500
                                    }}>
                                        Click to open
                                    </span>
                                    <div style={{
                                        background: board.background && board.background.includes('url')
                                            ? 'rgba(255, 255, 255, 0.2)'
                                            : 'var(--bg-hover)',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <ArrowRight 
                                            size={18} 
                                            className="board-arrow"
                                            style={{
                                                color: board.background && board.background.includes('url') 
                                                    ? 'white' 
                                                    : 'var(--primary)',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {boards.length === 0 && (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '60px 20px',
                                background: 'var(--card-glass-bg)',
                                backdropFilter: 'blur(16px)',
                                borderRadius: '20px',
                                border: '2px dashed var(--border-color)',
                                animation: 'fadeIn 0.8s ease-out'
                            }}>
                                <Sparkles size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '16px' }} />
                                <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No boards yet</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                    Create your first board to get started!
                                </p>
                            </div>
                        )}
                    </div>
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
                    <p style={{ marginBottom: "10px", color: "var(--text-muted)" }}>
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
                            border: "2px solid var(--border-color)",
                            borderRadius: "4px",
                            fontSize: "16px",
                            background: "var(--bg-page)",
                            color: "var(--text-main)"
                        }}
                    />
                </Modal>
            </div>
        </>
    );
};