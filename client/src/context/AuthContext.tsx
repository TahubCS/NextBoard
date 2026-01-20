import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";

interface AuthContextType {
    token: string | null;
    userEmail: string | null;
    userName: string | null;
    login: (token: string, email: string, name: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("email"));
    const [userName, setUserName] = useState<string | null>(localStorage.getItem("userName"));

    // Whenever the token changes, update axios headers automatically
    useEffect(() => {
        if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        localStorage.setItem("token", token);
        } else {
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("token");
        }
    }, [token]);

    const login = (newToken: string, email: string, name: string) => {
        setToken(newToken);
        setUserEmail(email);
        setUserName(name);
        localStorage.setItem("email", email);
        localStorage.setItem("userName", name);
    };

    const logout = () => {
        setToken(null);
        setUserEmail(null);
        setUserName(null);
        localStorage.removeItem("email");
        localStorage.removeItem("userName");
    };

    return (
        <AuthContext.Provider value={{ token, userEmail, userName, login, logout, isAuthenticated: !!token }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};