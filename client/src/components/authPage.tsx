import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import api from "../api/boardApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import NextBoard from "../assets/NextBoard.svg";

export const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const modeFromUrl = searchParams.get("mode");
    
    const [isLogin, setIsLogin] = useState(modeFromUrl !== "signup");
    
    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { login } = useAuth();

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
        if (modeFromUrl === "signup") {
            setIsLogin(false);
        }
    }, [modeFromUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLogin) {
            if (password !== confirmPassword) {
                toast.error("Passwords do not match!");
                return;
            }
            if (!name.trim()) {
                toast.error("Name is required.");
                return;
            }
            if (password.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }
        }

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register";
            const payload = isLogin ? { email, password } : { name, email, password };
            
            const response = await api.post(endpoint, payload);

            if (response.data.token) {
                login(response.data.token, response.data.email, response.data.name);
                toast.success(isLogin ? "Welcome back!" : "Account created! Welcome!");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "An error occurred";
            toast.error(errorMessage);
        }
    };

    return (
        <>
            {/* AUTH PAGE NAVBAR - FIXED */}
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
                    </div>
                </div>
            </nav>

            <div 
                className="auth-page-container" 
                style={{ 
                    background: "var(--home-gradient)", // Now uses global CSS variable
                    minHeight: "calc(100vh - 74px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "40px 20px 20px",
                    position: "relative",
                    transition: "background 0.3s ease"
                }}
            >
                {/* Floating background animations */}
                <div style={{
                    content: '',
                    position: 'fixed',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: '-100px',
                    right: '-100px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    animation: 'floatBubble1 20s ease-in-out infinite'
                }} />
                
                <div style={{
                    content: '',
                    position: 'fixed',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    bottom: '-50px',
                    left: '-50px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    animation: 'floatBubble2 15s ease-in-out infinite'
                }} />

                {/* --- AUTH BOX --- */}
                <div 
                    className="auth-box"
                    style={{
                        background: "var(--card-bg)",
                        padding: "48px 40px",
                        borderRadius: "24px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                        width: "100%",
                        maxWidth: "440px",
                        textAlign: "center",
                        border: "1px solid var(--border-color)",
                        backdropFilter: "blur(20px)",
                        position: "relative",
                        zIndex: 10
                    }}
                >
                    <button
                        onClick={() => navigate("/")}
                        title="Back to Home"
                        style={{
                            position: "absolute",
                            top: "16px",
                            left: "16px",
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--primary)";
                            e.currentTarget.style.background = "var(--bg-hover)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-muted)";
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <ArrowLeft size={30} />
                    </button>

                    <h2 style={{ 
                        marginBottom: "32px",
                        color: "var(--text-main)",
                        fontSize: "32px",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    marginBottom: "16px",
                                    border: "2px solid var(--border-color)",
                                    borderRadius: "12px",
                                    fontSize: "15px",
                                    transition: "all 0.2s ease",
                                    fontFamily: "inherit",
                                    background: "var(--bg-page)",
                                    color: "var(--text-main)"
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#667eea";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "var(--border-color)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                        )}

                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                marginBottom: "16px",
                                border: "2px solid var(--border-color)",
                                borderRadius: "12px",
                                fontSize: "15px",
                                transition: "all 0.2s ease",
                                fontFamily: "inherit",
                                background: "var(--bg-page)",
                                color: "var(--text-main)"
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "#667eea";
                                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.15)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "var(--border-color)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        />
                        
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            minLength={6}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                marginBottom: "16px",
                                border: "2px solid var(--border-color)",
                                borderRadius: "12px",
                                fontSize: "15px",
                                transition: "all 0.2s ease",
                                fontFamily: "inherit",
                                background: "var(--bg-page)",
                                color: "var(--text-main)"
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "#667eea";
                                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.15)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "var(--border-color)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        />

                        {!isLogin && (
                            <input 
                                type="password" 
                                placeholder="Confirm Password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                                minLength={6}
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    marginBottom: "16px",
                                    border: "2px solid var(--border-color)",
                                    borderRadius: "12px",
                                    fontSize: "15px",
                                    transition: "all 0.2s ease",
                                    fontFamily: "inherit",
                                    background: "var(--bg-page)",
                                    color: "var(--text-main)"
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#667eea";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "var(--border-color)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                        )}

                        <button 
                            type="submit" 
                            className="btn-primary"
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontWeight: 700,
                                fontSize: "16px",
                                cursor: "pointer",
                                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
                                transition: "all 0.3s ease",
                                marginTop: "8px"
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
                            {isLogin ? "Log In" : "Sign Up"}
                        </button>
                    </form>

                    <p style={{
                        marginTop: "24px",
                        fontSize: "15px",
                        color: "var(--text-muted)"
                    }}>
                        {isLogin ? "New here?" : "Already have an account?"}{" "}
                        <span 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setName("");
                                setEmail("");
                                setPassword("");
                                setConfirmPassword("");
                            }}
                            style={{
                                color: "#667eea",
                                cursor: "pointer",
                                fontWeight: 700,
                                textDecoration: "underline",
                                textDecorationThickness: "2px",
                                textUnderlineOffset: "4px"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#5568d3";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#667eea";
                            }}
                        >
                            {isLogin ? "Create an account" : "Log in"}
                        </span>
                    </p>
                </div>
            </div>
        </>
    );
};