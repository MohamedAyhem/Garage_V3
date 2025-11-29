import React from "react";
import Service from "./Service";
import { useContext } from "react";
import { GarageContext } from "../Contexts/GarageContext";
import { Link } from "react-router-dom";

const ServicesList = ({ title1, title2 }) => {
  const { services } = useContext(GarageContext);
  const firstThree = services.slice(0, 3);
  return (
    <div className="bg-[#1B252F] py-20 px-10 w-[100%] h-[500vh] border-b-[25px] border-b-[#FFDE01]">
      <p className="text-[#FFDE01] text-xl italic mb-[-20px]">{title1}</p>
      <div className="flex flex-col justify-between items-center gap-10 sm:flex-row mt-10">
        <h1 className="text-white text-5xl lg:text-5xl font-bold">{title2}</h1>
        <hr className="text-[#FFDE01] w-[70%]" />
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 gap-x-5 justify-items-center items-center">
        {firstThree.map((item) => (
          <Service
            key={item._id}
            title={item.name}
            image={item.image}
            id={item._id}
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center items-center">
        <Link to={"/services"}>
          <button className="bg-[#FFDE01] py-5 px-5 text-black cursor-pointer text-xl font-bold hover:bg-black hover:text-[#FFDE01]">
            View All Services <i class="fa-solid fa-forward ml-3"></i>
          </button>
        </Link>

        <button className="bg-[#FFDE01] py-5 px-5 text-black cursor-pointer text-xl font-bold hover:bg-black hover:text-[#FFDE01] ml-5">
          Book Online <i class="fa-solid fa-forward ml-3"></i>
        </button>
      </div>
    </div>
  );
};

export default ServicesList;
