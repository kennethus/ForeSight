import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const TopNavbar = ({ isDrawerOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get page title from the route
    const pageTitle = location.pathname.split("/")[1].toUpperCase() || "DASHBOARD";

    return (
        <div className={`fixed top-0 left-0 w-full bg-white px-5 py-3 flex justify-between items-center transition-all duration-300
            md:left-64 md:w-[calc(100vw-16rem)]`}>
            {/* Page Title */}
            <h2 className={`text-xl mt-5 font-medium text-black capitalize transition-all duration-300 ${isDrawerOpen ? "pl-4" : "pl-14"}`}>
                {pageTitle}
            </h2>

            {/* Profile Button */}
            <button 
                onClick={() => navigate("/profile")} 
                className="mt-5 bg-transparent outline-none border-none cursor-pointer"
            >
                <div className="flex items-center">
                    <img 
                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg" 
                        alt="User Profile" 
                        className="w-10 h-10 rounded-full"
                    />
                </div>
            </button>
        </div>
    );
};

TopNavbar.propTypes = {
    isDrawerOpen: PropTypes.bool.isRequired,
};

export default TopNavbar;
