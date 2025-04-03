import { Outlet } from "react-router-dom";
import SideDrawer from "./SideDrawer";
import TopNavbar from "./TopNavBar";
import { useState, useEffect } from "react";

const DashboardLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDrawerOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 mt-[60px]">
        <SideDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
        <TopNavbar isDrawerOpen={isDrawerOpen} />

        <div
          className={`flex-1 p-5 transition-all duration-300 
                        ${isDrawerOpen ? "md:ml-[250px]" : "ml-0"}
                    `}
        >
          <div className="m-1 z-0 overflow-hidden p-4 h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
