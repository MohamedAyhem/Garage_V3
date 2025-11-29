import React from "react";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
