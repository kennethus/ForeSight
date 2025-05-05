import { useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import AuthContext from "../context/authProvider";
import {
  FaWallet,
  FaChartLine,
  FaSignOutAlt,
  FaTh,
  FaBullseye,
  FaBars,
  FaMoneyBill,
} from "react-icons/fa";

const SideDrawer = ({ isOpen, setIsOpen }) => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Toggle drawer
  const toggleDrawer = () => setIsOpen(!isOpen);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  // Logout function
  const logoutHandler = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setAuth(null);
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
        className={`fixed top-4 left-4 mt-6 z-50 bg-white text-gray-800 p-2 rounded md:hidden transition-all duration-300`}
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-screen bg-blue-900 text-white shadow-lg transition-all duration-300 flex flex-col justify-between 
                    ${isOpen ? "w-64 p-5 z-50" : "w-0 p-0 overflow-hidden"} md:w-64 md:p-5 md:block`}
      >
        {/* Sidebar Content */}
        <div
          className={`flex flex-col h-full ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 mt-5 mb-12 justify-center">
            <img src="/logo.png" alt="Logo" className="h-10 w-10" />
            <h2 className="text-lg font-bold text-white">ForeSight</h2>
          </div>

          {/* Navigation - Centered Links */}
          <div className="flex-1 flex flex-row justify-center">
            <nav className="flex flex-col gap-y-6">
              <NavItem to="/dashboard" icon={<FaTh />} text="Dashboard" />
              <NavItem
                to="/transactions"
                icon={<FaWallet />}
                text="Transactions"
              />
              <NavItem to="/budgets" icon={<FaMoneyBill />} text="Budgets" />
              <NavItem
                to="/financial-goals"
                icon={<FaBullseye />}
                text="Savings"
              />
              <NavItem to="/forecast" icon={<FaChartLine />} text="Forecast" />
            </nav>
          </div>

          {/* Logout Button */}
          <button
            onClick={logoutHandler}
            className="mt-auto flex items-center space-x-3 text-white-500 hover:text-red-400 transition-colors duration-300"
          >
            <FaSignOutAlt size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div
          onClick={toggleDrawer}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
    </>
  );
};

/**
 * Navigation Item Component
 */
const NavItem = ({ to, icon, text }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to); // Ensures "transactions" stays active

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 transition-colors duration-300 active:text-blue-900 
                ${isActive ? "text-blue-400 font-semibold" : "text-white hover:text-blue-400"}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

SideDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default SideDrawer;
