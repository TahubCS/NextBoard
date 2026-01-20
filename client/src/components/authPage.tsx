import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/boardApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const modeFromUrl = searchParams.get("mode");
    
    const [isLogin, setIsLogin] = useState(modeFromUrl !== "signup");
    
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

        // Client-side Validation
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

            // Both login AND register now return token, email, and name
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
                        minLength={6}
                    />

                    {/* Show Confirm Password only when Registering */}
                    {!isLogin && (
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                            minLength={6}
                        />
                    )}

                    <button type="submit" className="btn-primary">
                        {isLogin ? "Log In" : "Sign Up"}
                    </button>
                </form>

                <p className="toggle-text">
                    {isLogin ? "New here?" : "Already have an account?"}{" "}
                    <span onClick={() => {
                        setIsLogin(!isLogin);
                        // Clear form when switching
                        setName("");
                        setEmail("");
                        setPassword("");
                        setConfirmPassword("");
                    }}>
                        {isLogin ? "Create an account" : "Log in"}
                    </span>
                </p>
            </div>
        </div>
    );
};