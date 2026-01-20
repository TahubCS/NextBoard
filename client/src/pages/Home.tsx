import { useNavigate } from "react-router-dom";
import { CheckCircle, Zap, Users, BarChart3, ArrowRight, Sparkles, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import "./home.css";

export const Home = () => {
    const navigate = useNavigate();
    
    // Load theme from localStorage
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark";
    });

    // Apply theme on mount and when darkMode changes
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

    return (
        <div className="home-container">
            {/* THEME TOGGLE BUTTON - TOP RIGHT */}
            <button 
                onClick={toggleTheme}
                className="theme-toggle-home"
                title="Toggle Theme"
            >
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {/* HERO SECTION - FULL VIEWPORT */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="sketch-container">
                        {/* Animated sketch lines */}
                        <svg className="sketch-line sketch-line-1" viewBox="0 0 200 200">
                            <path d="M10,100 Q100,10 190,100" stroke="#0079bf" strokeWidth="3" fill="none" />
                        </svg>
                        <svg className="sketch-line sketch-line-2" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="80" stroke="#5067c5" strokeWidth="3" fill="none" />
                        </svg>
                        <svg className="sketch-line sketch-line-3" viewBox="0 0 200 200">
                            <path d="M50,50 L150,150 M150,50 L50,150" stroke="#ff6b6b" strokeWidth="3" />
                        </svg>
                    </div>

                    <h1 className="hero-title">
                        Organize Your Work,
                        <span className="gradient-text">Amplify Your Productivity</span>
                    </h1>
                    
                    <p className="hero-subtitle">
                        The visual project management tool that helps teams collaborate, 
                        track progress, and ship faster—all in one beautiful interface.
                    </p>

                    <div className="cta-buttons">
                        <button 
                            className="btn-hero btn-primary-hero" 
                            onClick={() => navigate("/login?mode=signup")}
                        >
                            Get Started Free
                            <ArrowRight size={20} />
                        </button>
                        <button 
                            className="btn-hero btn-secondary-hero" 
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </div>

                    <p className="hero-note">
                        <Sparkles size={16} /> No credit card required • Free forever plan available
                    </p>
                </div>

                {/* ANIMATED KANBAN PREVIEW */}
                <div className="hero-preview">
                    <div className="preview-board">
                        <div className="preview-column">
                            <div className="preview-header">To Do</div>
                            <div className="preview-card card-animate-1"></div>
                            <div className="preview-card card-animate-2"></div>
                        </div>
                        <div className="preview-column">
                            <div className="preview-header">In Progress</div>
                            <div className="preview-card card-animate-3"></div>
                        </div>
                        <div className="preview-column">
                            <div className="preview-header">Done</div>
                            <div className="preview-card card-animate-4"></div>
                            <div className="preview-card card-animate-5"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features-section">
                <h2 className="section-title">Everything you need to stay organized</h2>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Zap size={32} />
                        </div>
                        <h3>Lightning Fast</h3>
                        <p>Drag, drop, and organize tasks in milliseconds. Built for speed and efficiency.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Users size={32} />
                        </div>
                        <h3>Team Collaboration</h3>
                        <p>Work together seamlessly with your team. Assign tasks, track progress, and achieve goals.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <BarChart3 size={32} />
                        </div>
                        <h3>Visual Progress</h3>
                        <p>See your workflow at a glance. Prioritize tasks and never miss a deadline.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <CheckCircle size={32} />
                        </div>
                        <h3>Rich Task Details</h3>
                        <p>Add descriptions, due dates, priorities, and more to keep every detail organized.</p>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to boost your productivity?</h2>
                    <p>Join thousands of teams already organizing their work with Kanban SaaS</p>
                    <button 
                        className="btn-hero btn-primary-hero btn-large" 
                        onClick={() => navigate("/login?mode=signup")}
                    >
                        Start For Free Today
                        <ArrowRight size={24} />
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="home-footer">
                <p>© 2026 NexBoard. Built with ❤️ for productive teams.</p>
            </footer>
        </div>
    );
};