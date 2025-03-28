import { Outlet } from "react-router-dom";
import SideDrawer from "./SideDrawer";
import TopNavbar from "./TopNavBar";

const DashboardLayout = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopNavbar />
            <div style={{ display: "flex", flex: 1 }}>
                <SideDrawer />
                <div style={{ flex: 1, padding: "20px", marginLeft: "250px" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
