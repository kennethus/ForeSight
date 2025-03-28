import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";

const SideDrawer = () => {
    const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    // Toggle drawer for mobile
    const toggleDrawer = () => setIsOpen(!isOpen);

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            setIsOpen(window.innerWidth >= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Logout function
    const logoutHandler = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/logout`,
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                setAuth(null); // Clear auth context
                navigate("/", { replace: true });
            } else {
                console.error("Logout failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            window.location.reload();
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleDrawer}
                style={{
                    position: "absolute",
                    top: "10px",
                    left: isOpen ? "260px" : "10px",
                    zIndex: 1001,
                    background: "#2C3E50",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    cursor: "pointer",
                    transition: "left 0.3s"
                }}
            >
                ☰
            </button>

            {/* Sidebar Drawer */}
            <div
                style={{
                    width: isOpen ? "250px" : "0",
                    height: "100vh",
                    background: "#2C3E50",
                    color: "white",
                    position: "fixed",
                    top: "0",
                    left: "0",
                    overflowX: "hidden",
                    transition: "width 0.3s",
                    padding: isOpen ? "20px" : "0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "100vh", // Ensures space for logout button
                }}
            >
                {isOpen && (
                    <>
                        <div style={{ flexGrow: 1 }}>
                            <h2>ForeSight</h2>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                <li><Link to="/dashboard" style={linkStyle}>🏠 Home</Link></li>
                                <li><Link to="/transactions" style={linkStyle}>💰 Transactions</Link></li>
                                <li><Link to="/budgets" style={linkStyle}>📊 Budgets</Link></li>
                                <li><Link to="/financial-goals" style={linkStyle}>🎯 Financial Goals</Link></li>
                                <li><Link to="/forecast" style={linkStyle}>📈 Forecast</Link></li>

                            </ul>
                        </div>

                        {/* Logout Button - Moved Up & Made Clickable */}
                        <button
                            onClick={logoutHandler}
                            style={{
                                background: "red",
                                color: "white",
                                border: "none",
                                padding: "10px",
                                cursor: "pointer",
                                width: "100%",
                                textAlign: "center",
                                marginBottom: "20px", // Adds space above the button
                            }}
                        >
                            🔒 Logout
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

// Style for links
const linkStyle = {
    display: "block",
    color: "white",
    textDecoration: "none",
    padding: "10px 0"
};

export default SideDrawer;
