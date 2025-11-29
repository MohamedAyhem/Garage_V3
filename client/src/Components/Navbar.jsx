import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import Collapse from "@mui/material/Collapse";
import { useUser } from "@clerk/clerk-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import LocationPopup from "./LocationPopup";
import LocationDropdown from "./LocationDropdown";
import VehiclePopup from "./VehiclePopup";
import VehicleDropdown from "./VehicleDropdown";
import useMobileLayout from "../hooks/useMobileLayout";
import NavbarMobile from "./NavbarMobile";

const Navbar = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const isMobile = useMobileLayout();

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !hasCheckedUser) {
      const vehiclesKey = `savedVehicles_${user.id}`;
      const locationKey = `userLocation_${user.id}`;
      const setupCompletedKey = `setupCompleted_${user.id}`;

      const hasVehicles = localStorage.getItem(vehiclesKey);
      const hasLocation = localStorage.getItem(locationKey);
      const hasCompletedSetup = localStorage.getItem(setupCompletedKey);

      if (!hasCompletedSetup) {
        if (!hasVehicles) {
          setShowVehiclePopup(true);
        } else if (!hasLocation) {
          setShowLocationPopup(true);
        }

        if (hasVehicles && hasLocation) {
          localStorage.setItem(setupCompletedKey, "true");
        }
      }

      setHasCheckedUser(true);
    }
  }, [isLoaded, isSignedIn, user, hasCheckedUser]);

  const ShowMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleCloseLocationPopup = () => {
    setShowLocationPopup(false);
  };

  const handleCloseVehiclePopup = () => {
    setShowVehiclePopup(false);

    if (user && isSignedIn) {
      const locationKey = `userLocation_${user.id}`;
      const hasLocation = localStorage.getItem(locationKey);

      if (!hasLocation) {
        setShowLocationPopup(true);
      }
    }
  };

  const handleLocationSet = (locationData) => {
    if (typeof locationData === "object" && locationData.address) {
      setUserAddress(locationData.address);
      if (user) {
        localStorage.setItem(
          `userLocation_${user.id}`,
          JSON.stringify(locationData)
        );
        window.dispatchEvent(
          new CustomEvent("locationChanged", { detail: locationData })
        );
      }
    } else {
      setUserAddress(locationData);
    }
    setShowLocationPopup(false);
  };
  const handleVehicleAdd = (vehicle) => {
    if (user) {
      const vehiclesKey = `savedVehicles_${user.id}`;
      const storedVehicles = localStorage.getItem(vehiclesKey);
      const vehicles = storedVehicles ? JSON.parse(storedVehicles) : [];
      const updatedVehicles = [...vehicles, vehicle];

      localStorage.setItem(vehiclesKey, JSON.stringify(updatedVehicles));
      localStorage.setItem(
        `selectedVehicle_${user.id}`,
        JSON.stringify(vehicle)
      );

      setSelectedVehicle(vehicle);

      window.dispatchEvent(new Event("storage"));

      setShowVehiclePopup(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      setHasCheckedUser(false);
    }
  }, [isSignedIn]);

  if (isMobile) {
    return (
      <NavbarMobile
        userAddress={userAddress}
        selectedVehicle={selectedVehicle}
        showLocationPopup={showLocationPopup}
        showVehiclePopup={showVehiclePopup}
        setShowLocationPopup={setShowLocationPopup}
        setShowVehiclePopup={setShowVehiclePopup}
        handleCloseLocationPopup={handleCloseLocationPopup}
        handleCloseVehiclePopup={handleCloseVehiclePopup}
        handleLocationSet={handleLocationSet}
        handleVehicleAdd={handleVehicleAdd}
        setUserAddress={setUserAddress}
        setSelectedVehicle={setSelectedVehicle}
      />
    );
  }

  return (
    <div className="z-50 w-[90%] mx-auto fixed top-5 left-1/2 -translate-x-1/2">
      <div className="bg-[#FFDE01] h-[45px] flex flex-row justify-between items-center px-5 sm:px-10 font-extrabold text-sm sm:text-lg relative">
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

        <div className="flex items-center gap-4">
          <LocationDropdown
            userAddress={userAddress}
            setUserAddress={setUserAddress}
            setShowLocationPopup={setShowLocationPopup}
          />

          <VehicleDropdown
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            setShowVehiclePopup={setShowVehiclePopup}
          />

          <SignedIn>
            <Link to="/client-dashboard" className="hover:text-[#1A1A1A] cursor-pointer text-sm md:text-base px-2 flex items-center gap-1">
              <i className="fa-solid fa-gauge mr-2"></i>
              <span className="hidden md:inline">DASHBOARD</span>
            </Link>
          </SignedIn>

          <SignedOut>
            <button
              onClick={() => navigate("/garage-auth")}
              className="hover:text-[#1A1A1A] cursor-pointer text-sm md:text-base px-2 flex items-center gap-1"
              title="Garage Owner Portal"
            >
              <i className="fa-solid fa-warehouse"></i>
              Do you own a garage?
            </button>
            <span className="text-[#1A1A1A]">|</span>
            <SignInButton
              mode="modal"
              className="hover:text-[#1A1A1A] cursor-pointer"
            >
              <span className="hover:text-[#1A1A1A] transition-colors ">
                Log In |
              </span>
            </SignInButton>
            <SignUpButton
              mode="modal"
              className="hover:text-[#1A1A1A] cursor-pointer"
            >
              <span className="hover:text-[#1A1A1A] transition-colors">
                Sign Up
              </span>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      <div className="px-5 sm:px-10 bg-[#1A1A1A] flex flex-row items-center gap-10 sm:justify-between h-[110px] border-b-3 border-[#FFDE01]">
        <Link to="/">
          <img src="./logo.png" className="w-30 md:w-60" alt="" />
        </Link>
        <ul className="hidden sm:flex flex-row text-white font-extrabold gap-10 text-sm md:text-lg ">
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
            <div className="group-hover:block hidden absolute dropdown-menu left-0 pt-1 text-sm z-50">
              <div className="flex flex-col gap-2 w-60 bg-[#1A1A1A] text-white border border-[#FFDE01]/20 rounded-lg overflow-hidden">
                <p className="py-3 px-5 cursor-pointer hover:text-black hover:bg-[#FFDE01] transition-colors">
                  MOT
                </p>
                <p className="py-3 px-5 cursor-pointer hover:text-black hover:bg-[#FFDE01] transition-colors">
                  REMAPPING
                </p>
                <p className="py-3 px-5 cursor-pointer hover:text-black hover:bg-[#FFDE01] transition-colors">
                  REPAIRS
                </p>
              </div>
            </div>
          </li>
          <SignedIn>
            <li>
              <NavLink
                to="/client-dashboard"
                className={({ isActive }) =>
                  isActive ? "text-[#FFDE01]" : "text-white hover:text-[#FFDE01]"
                }
              >
                <i className="fa-solid fa-gauge mr-2"></i>
                DASHBOARD
              </NavLink>
            </li>
          </SignedIn>
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
        <div className="sm:hidden bg-[#1A1A1A] flex flex-col gap-2 px-5 py-3 text-white font-bold border-b border-[#FFDE01]">
          <NavLink
            onClick={ShowMenu}
            className="py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded transition-colors"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={ShowMenu}
            className="py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded transition-colors"
            to="/Services"
          >
            SERVICES
          </NavLink>
          <SignedIn>
            <NavLink
              onClick={ShowMenu}
              className="py-2 px-3 hover:bg-[#FFDE01] hover:text-black rounded transition-colors"
              to="/client-dashboard"
            >
              <i className="fa-solid fa-gauge mr-2"></i>
              DASHBOARD
            </NavLink>
          </SignedIn>
        </div>
      </Collapse>

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

export default Navbar;
