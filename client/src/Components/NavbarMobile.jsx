import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import LocationPopup from "./LocationPopup";
import VehiclePopup from "./VehiclePopup";
import LocationDropdown from "./LocationDropdown";
import VehicleDropdown from "./VehicleDropdown";

const NavbarMobile = ({
  userAddress,
  selectedVehicle,
  showLocationPopup,
  showVehiclePopup,
  setShowLocationPopup,
  setShowVehiclePopup,
  handleCloseLocationPopup,
  handleCloseVehiclePopup,
  handleLocationSet,
  handleVehicleAdd,
  setUserAddress,
  setSelectedVehicle,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.querySelector(".mobile-menu");
      const menuButton = document.querySelector(".menu-button");

      if (mobileMenu && menuButton) {
        if (
          !mobileMenu.contains(event.target) &&
          !menuButton.contains(event.target)
        ) {
          setShowMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ShowMenu = () => {
    setShowMenu((prev) => !prev);
  };

  return (
    <div className="z-50 w-[90%] mx-auto fixed top-5 left-1/2 -translate-x-1/2">
      <div className="bg-[#FFDE01] h-[45px] flex flex-row justify-between items-center px-3 font-extrabold text-sm text-black overflow-x-auto whitespace-nowrap">
        <div className="flex-shrink-0"></div>
        <div className="flex items-center gap-1 md:gap-3">
          <div className="flex-shrink-0">
            <LocationDropdown
              userAddress={userAddress}
              setUserAddress={setUserAddress}
              setShowLocationPopup={setShowLocationPopup}
            />
          </div>
          <div className="flex-shrink-0">
            <VehicleDropdown
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              setShowVehiclePopup={setShowVehiclePopup}
            />
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-1 md:gap-2">
              {" "}
              <SignInButton mode="modal">
                <button
                  className="flex items-center gap-1 md:gap-2 hover:text-[#1A1A1A] transition-colors p-1 md:p-2 rounded-lg hover:bg-[#e6c801]"
                  title="Login"
                >
                  <i className="fa-solid fa-right-to-bracket text-sm md:text-base"></i>
                  <span className="hidden md:inline">Login</span>
                </button>
              </SignInButton>
              <span className="hidden md:inline">|</span>
              <SignUpButton mode="modal">
                <button
                  className="flex items-center gap-1 md:gap-2 hover:text-[#1A1A1A] transition-colors p-1 md:p-2 rounded-lg hover:bg-[#e6c801]"
                  title="Sign Up"
                >
                  <i className="fa-solid fa-user-plus text-sm md:text-base"></i>
                  <span className="hidden md:inline">Sign Up</span>
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
      <div className="px-5 bg-[#1A1A1A] flex flex-row justify-between items-center h-[80px] border-b-3 border-[#FFDE01]">
        <img src="./logo.png" className="w-40" alt="Logo" />
        <button
          onClick={ShowMenu}
          className="menu-button flex items-center gap-2 text-xl text-white hover:text-[#FFDE01] transition-colors p-2 rounded"
          aria-label={showMenu ? "Close menu" : "Open menu"}
        >
          <i
            className={`fa-solid ${
              showMenu ? "fa-times" : "fa-bars"
            } transition-transform duration-300`}
          ></i>
        </button>
      </div>
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/20 transition-opacity duration-300"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
      <div
        className={`mobile-menu absolute top-full left-0 right-0 bg-[#1A1A1A] flex flex-col gap-2 px-5 py-3 text-white font-bold border-t border-b border-[#FFDE01] shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
          showMenu
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <NavLink
          onClick={ShowMenu}
          className={({ isActive }) =>
            `py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded transition-colors ${
              isActive ? "bg-[#FFDE01] text-black" : ""
            }`
          }
          to="/"
        >
          HOME
        </NavLink>
        <NavLink
          onClick={ShowMenu}
          className={({ isActive }) =>
            `py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded transition-colors ${
              isActive ? "bg-[#FFDE01] text-black" : ""
            }`
          }
          to="/Services"
        >
          SERVICES
        </NavLink>
        <NavLink
          onClick={ShowMenu}
          className={({ isActive }) =>
            `py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded transition-colors ${
              isActive ? "bg-[#FFDE01] text-black" : ""
            }`
          }
          to="/repairs"
        >
          REPAIRS
        </NavLink>
      </div>
      <LocationPopup
        isOpen={showLocationPopup}
        onClose={handleCloseLocationPopup}
        onLocationSet={handleLocationSet}
      />
      <VehiclePopup
        isOpen={showVehiclePopup}
        onClose={handleCloseVehiclePopup}
        onVehicleAdd={handleVehicleAdd}
      />
    </div>
  );
};

export default NavbarMobile;
