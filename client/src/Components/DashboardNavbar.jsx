import React from "react";
import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";

const DashboardNavbar = () => {
  const { user } = useUser();

  return (
    <nav className="bg-white px-5 sm:px-10  sticky top-0 z-30 h-16 flex justify-between py-5 flex-row items-center">
      <div className="hidden flex-col lg:flex">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="text-sm text-gray-400">
          Hello <span className="font-bold">{user.firstName}</span> Let's check
          your Garage today
        </p>
      </div>
      <div className="flex lg:hidden flex-row justify-between w-full mr-5">
        <Link to="" className="rounded-full">
          <i className="fa-solid fa-warehouse text-black"></i>
        </Link>

        <Link to="" className="rounded-full">
          <i className="fa-solid fa-table-columns text-black"></i>
        </Link>

        <Link to="" className="rounded-full">
          <i className="fa-solid fa-people-group text-black"></i>
        </Link>

        <Link to="" className="rounded-full">
          <i className="fa-solid fa-calendar-days text-black"></i>
        </Link>

        <Link to="" className="rounded-full">
          <i className="fa-solid fa-user-group text-black "></i>
        </Link>

        <Link to="" className="rounded-full">
          <i className="fa-solid fa-arrow-right-from-bracket text-black "></i>
        </Link>
      </div>
      <div className="md:flex hidden py-3 px-8 flex-row items-center gap-2 bg-gray-200 rounded-2xl">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          className="w-40 md:w-full outline-none border-none px-2"
          placeholder="Search ..."
        />
      </div>

      <div className="flex flex-row items-center gap-4 ml-2 scale-150">
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
};

export default DashboardNavbar;
