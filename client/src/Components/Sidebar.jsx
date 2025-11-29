import React from "react";
import { Link } from "react-router-dom";

import { SignOutButton } from "@clerk/clerk-react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-black  hidden lg:flex flex-col h-screen sticky top-0 py-10 px-5 gap-20">
      <div className="w-full">
        <img src="/logo.png" className="w-full" alt="" />
      </div>
      <div>
        <ul className="text-white text-sm flex gap-5 flex-col">
          <Link
            to="/myGarages"
            className="flex flex-row gap-5 items-center w-full"
          >
            <li className="py-5 w-full px-5 flex flex-row gap-5 items-center rounded-2xl cursor-pointer hover:bg-yellow-300 group transition-colors duration-300 ease-in-out">
              <i className="fa-solid fa-warehouse text-yellow-300 group-hover:text-black transition-colors duration-300 ease-in-out"></i>
              <p className="group-hover:text-black transition-colors duration-300 ease-in-out">
                My Garages
              </p>
            </li>
          </Link>
          <Link
            to="/dashboard"
            className="flex flex-row gap-5 items-center w-full"
          >
            <li className="py-5 w-full px-5 flex flex-row gap-5 items-center rounded-2xl cursor-pointer hover:bg-yellow-300 group transition-colors duration-300 ease-in-out">
              <i className="fa-solid fa-table-columns text-yellow-300 group-hover:text-black transition-colors duration-300 ease-in-out"></i>
              <p className="group-hover:text-black transition-colors duration-300 ease-in-out">
                Dashboard
              </p>
            </li>
          </Link>

          <Link
            to="/customers"
            className="flex flex-row gap-5 items-center w-full"
          >
            <li className="py-5 w-full px-5 flex flex-row gap-5 items-center rounded-2xl cursor-pointer hover:bg-yellow-300 group transition-colors duration-300 ease-in-out">
              <i className="fa-solid fa-people-group text-yellow-300 group-hover:text-black transition-colors duration-300 ease-in-out"></i>
              <p className="group-hover:text-black transition-colors duration-300 ease-in-out">
                Customers
              </p>
            </li>
          </Link>

          <Link
            to="/reservations"
            className="flex flex-row gap-5 items-center w-full"
          >
            <li className="py-5 w-full px-5 flex flex-row gap-5 items-center rounded-2xl cursor-pointer hover:bg-yellow-300 group transition-colors duration-300 ease-in-out">
              <i className="fa-solid fa-calendar-days text-yellow-300 group-hover:text-black transition-colors duration-300 ease-in-out"></i>
              <p className="group-hover:text-black transition-colors duration-300 ease-in-out">
                Reservations
              </p>
            </li>
          </Link>

          <Link to="/mechanics">
            <li className="py-5 px-5 w-full flex flex-row gap-5 items-center rounded-2xl cursor-pointer hover:bg-yellow-300 group transition-colors duration-300 ease-in-out">
              <i className="fa-solid fa-user-group text-yellow-300 group-hover:text-black transition-colors duration-300 ease-in-out"></i>
              <p className="group-hover:text-black transition-colors duration-300 ease-in-out">
                Staff Management
              </p>
            </li>
          </Link>
        </ul>
        <SignOutButton redirectUrl="/">
          <div className="text-black flex flex-row gap-5 items-center absolute bottom-10 bg-yellow-300 py-5 px-10 cursor-pointer rounded-2xl">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <h1 className="font-bold">Back To Home</h1>
          </div>
        </SignOutButton>
      </div>
    </aside>
  );
};

export default Sidebar;
