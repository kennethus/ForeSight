import { Outlet } from "react-router-dom";
import SideDrawer from "../components/SideDrawer";

const DashboardLayout = () => {
    return (
        <div style={{ display: "flex" }}>
            <SideDrawer /> {/* Sidebar stays fixed */}
            <div style={{ flex: 1, padding: "20px", marginLeft: "250px" }}>
                <Outlet /> {/* Renders the child components dynamically */}
            </div>
        </div>
    );
};

export default DashboardLayout;
