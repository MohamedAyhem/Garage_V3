import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Collapse from "@mui/material/Collapse";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const ShowMenu = () => {
    setShowMenu((prev) => !prev);
  };
  return (
    <div className="z-50 w-[90%] mx-auto fixed top-5 left-1/2 -translate-x-1/2 ">
      <div className="bg-[#FFDE01] h-[45px] flex flex-row justify-between items-center px-5 sm:px-10 font-extrabold text-sm sm:text-lg">
        <div className="flex flex-row gap-10">
          <p>
            <i className="fa-solid fa-phone-flip mr-2"></i>
            07960747121
          </p>
          <p className="hidden sm:block">
            <i className="fa-solid fa-phone-flip mr-2"></i>
            07960747222
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard" className="hover:text-black transition-colors">
            <i className="fa-solid fa-gauge mr-2"></i>
            <span className="hidden md:inline">DASHBOARD</span>
          </Link>
          <Link className="hover:text-black transition-colors">
            BOOK ONLINE <i className="fa-solid fa-forward"></i>
          </Link>
        </div>
      </div>
      <div className="px-5 sm:px-10 bg-[#1A1A1A] flex flex-row items-center gap-10 sm:justify-between h-[110px] border-b-3 border-[#FFDE01]">
        <Link to="/">
          <img src="./logo.png" className="w-30 md:w-60" alt="" />
        </Link>
        <ul className="hidden sm:flex flex-row text-white font-extrabold  gap-10 text-sm md:text-lg ">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-[#FFDE01]" : "text-white hover:text-[#FFDE01]"
              }
            >
              HOME
            </NavLink>
          </li>
          <li className="group relative">
            <NavLink
              to="/Services"
              className={({ isActive }) =>
                isActive ? "text-[#FFDE01]" : "text-white hover:text-[#FFDE01]"
              }
            >
              SERVICES
              <i className="fa-solid fa-chevron-down ml-2"></i>
            </NavLink>
            <div className="group-hover:block hidden absolute dropdown-menu left-0 pt-1 text-sm">
              <div className="flex flex-col gap-2 w-60  bg-[#1A1A1A] text-white">
                <p className="py-3 px-5 cursor-pointer hover:text-black hover:bg-[#FFDE01]">
                  MOT
                </p>
                <p className="py-3 px-5 cursor-pointer hover:text-black hover:bg-[#FFDE01]">
                  REMAPPING
                </p>
                <p className="py-3 px-5 cursor-pointer hover:text-black hover:bg-[#FFDE01]">
                  REPAIRS
                </p>
              </div>
            </div>
          </li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "text-[#FFDE01]" : "text-white hover:text-[#FFDE01]"
              }
            >
              <i className="fa-solid fa-gauge mr-2"></i>
              DASHBOARD
            </NavLink>
          </li>
        </ul>
        <div
          onClick={ShowMenu}
          className="flex sm:hidden flex-row mx-auto gap-2 text-xl text-white items-center mr-20 cursor-pointer"
        >
          <i className="fa-solid fa-bars"></i>
          <p>MENU</p>
        </div>
      </div>
      <Collapse in={showMenu} timeout="auto" unmountOnExit>
        <div className="sm:hidden bg-[#1A1A1A] flex flex-col gap-2 px-5 py-3 text-white font-bold">
          <NavLink
            onClick={ShowMenu}
            className="py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={ShowMenu}
            className="py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded"
            to="/Services"
          >
            SERVICES
          </NavLink>
          <NavLink
            onClick={ShowMenu}
            className="py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded"
            to="/dashboard"
          >
            <i className="fa-solid fa-gauge mr-2"></i>
            DASHBOARD
          </NavLink>
        </div>
      </Collapse>
    </div>
  );
};

export default Navbar;