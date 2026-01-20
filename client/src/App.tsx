import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { KanbanBoard } from "./components/KanbanBoard";
import { AuthPage } from "./components/authPage";
import { Dashboard } from "./components/Dashboard";
import { Home } from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { useState, useEffect, type JSX } from "react";
import { Moon, Sun, LogOut } from "lucide-react";

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Navbar Component (only shows when authenticated)
const Navbar = () => {
  const { logout, userName } = useAuth();
  const navigate = useNavigate();
  
  // Load theme from localStorage, default to light if not set
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
    <div 
      className="navbar" 
      style={{ 
        padding: "15px 20px", 
        borderBottom: "1px solid var(--border-color)",
        color: darkMode ? "#b6c2cf" : "white",
        backgroundColor: darkMode ? "#1d2125" : "#026aa7",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        transition: "background-color 0.3s ease"
      }}
    >
      <h2 
        onClick={() => navigate("/")}
        style={{ 
          margin: 0, 
          fontSize: "1.2rem", 
          cursor: "pointer",
          transition: "opacity 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        NexBoard
      </h2>
      
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button 
          onClick={toggleTheme}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <span>Welcome, <strong>{userName}</strong></span>
        
        <button 
          onClick={logout} 
          className="btn-logout"
          style={{ 
            background: "rgba(255,255,255,0.2)", 
            border: "none", 
            color: "inherit", 
            padding: "5px 10px", 
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  return (
    <div className="app-root">
      <Toaster position="top-center" />
      
      {/* Conditionally render navbar only when authenticated */}
      {isAuthenticated && <Navbar />}

      {/* Main Content */}
      <div 
        className="main-content" 
        style={{ 
          height: isAuthenticated ? "calc(100vh - 60px)" : "100vh" 
        }}
      >
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} 
          />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} 
          />

          {/* PROTECTED ROUTES */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/board/:boardId" 
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            } 
          />

          {/* CATCH ALL - Redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;