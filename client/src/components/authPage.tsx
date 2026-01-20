import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // <--- NEW IMPORT
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/boardApi";
import toast from "react-hot-toast";

export const AuthPage = () => {
    const [searchParams] = useSearchParams(); // <--- NEW: Get URL params
    const modeFromUrl = searchParams.get("mode"); // <--- Check for ?mode=signup
    
    const [isLogin, setIsLogin] = useState(modeFromUrl !== "signup"); // <--- Set initial state
    
    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { login } = useAuth();

    // Update isLogin when URL changes
    useEffect(() => {
        if (modeFromUrl === "signup") {
            setIsLogin(false);
        }
    }, [modeFromUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Client-side Validation
        if (!isLogin) {
            if (password !== confirmPassword) {
                toast.error("Passwords do not match!");
                return;
            }
            if (!name.trim()) {
                toast.error("Name is required.");
                return;
            }
        }

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register";
            const payload = isLogin ? { email, password } : { name, email, password };
            
            const response = await axios.post(`${API_URL}${endpoint}`, payload);

            if (isLogin) {
                login(response.data.token, response.data.email, response.data.name);
            } else {
                // On register success, switch to login
                setIsLogin(true);
                setPassword("");
                setConfirmPassword("");
                toast.success("Account created! Please log in.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>            
                <form onSubmit={handleSubmit}>
                    {/* Show Name input only when Registering */}
                    {!isLogin && (
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    )}

                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                    
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />

                    {/* Show Confirm Password only when Registering */}
                    {!isLogin && (
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    )}

                    <button type="submit" className="btn-primary">
                        {isLogin ? "Log In" : "Sign Up"}
                    </button>
                </form>

                <p className="toggle-text">
                    {isLogin ? "New here?" : "Already have an account?"}{" "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Create an account" : "Log in"}
                    </span>
                </p>
            </div>
        </div>
    );
};