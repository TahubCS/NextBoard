import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import NextBoard from "../assets/NextBoard.svg";

export const Navbar = () => {
    const { isAuthenticated, logout, userName } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
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

    // Check if we are on a public page (Home or Auth)
    const isPublicPage = location.pathname === "/" || location.pathname === "/login";

    return (
        <nav 
            style={{
                position: isPublicPage ? "absolute" : "sticky",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: "16px 5%",
                // GLASS EFFECT FOR ALL PAGES
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(100px)",
                WebkitBackdropFilter: "blur(100px)", // Safari support
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

                    {/* AUTHENTICATED STATE */}
                    {isAuthenticated ? (
                        <>
                            <span 
                                className="nav-user"
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
                        </>
                    ) : (
                        /* PUBLIC STATE (Home/Login) */
                        <>
                            {location.pathname !== "/login" && (
                                <>
                                    <button 
                                        onClick={() => navigate("/login")}
                                        style={{
                                            background: "transparent",
                                            color: "white",
                                            border: "2px solid rgba(255, 255, 255, 0.3)",
                                            padding: "10px 24px",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            fontSize: "14px",
                                            transition: "all 0.3s ease",
                                            backdropFilter: "blur(10px)",
                                            WebkitBackdropFilter: "blur(10px)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }}
                                    >
                                        Login
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate("/login?mode=signup")}
                                        style={{
                                            background: "white",
                                            color: "#667eea",
                                            border: "none",
                                            padding: "10px 24px",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            fontSize: "14px",
                                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.2)";
                                        }}
                                    >
                                        Sign Up Free
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};