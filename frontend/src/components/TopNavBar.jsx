import { useLocation, useNavigate } from "react-router-dom";

const TopNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get page title from route
    const pageTitle = location.pathname.split("/")[1].toUpperCase() || "DASHBOARD";

    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
            borderBottom: "1px solid #ccc",
        }}>
            <h2>{pageTitle}</h2>
            <button 
            onClick={() => navigate("/profile")}
            style={{backgroundColor:"transparent", outline: 'none', border: 'none'}}
            >
                <div 
                    style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                    <img 
                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg" 
                        alt="User Profile" 
                        style={{ width: "40px", height: "40px",borderRadius: "50%", marginRight: "10px" }} 
                    />
                </div>
            </button>
        </nav>
    );
};

export default TopNavbar;
