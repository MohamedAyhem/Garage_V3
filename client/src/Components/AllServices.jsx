import React, { useContext } from "react";
import Service from "./Service";
import { GarageContext } from "../Contexts/GarageContext";

const AllServices = () => {
  const {services} = useContext(GarageContext);
  return (
    <div className="bg-[#1B252F] py-20 px-10 w-[100%] h-[500vh] border-b-[25px] border-b-[#FFDE01]">
      <p className="text-[#FFDE01] text-xl italic mb-[-20px]">ALL</p>
      <div className="flex flex-col justify-between items-center gap-10 sm:flex-row mt-10">
        <h1 className="text-white text-5xl lg:text-5xl font-bold">SERVICES</h1>
        <hr className="text-[#FFDE01] w-[70%]" />
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 gap-x-5 justify-items-center items-center">
        {
          services.map((item)=>(
            <Service title={item.name} image={item.image} id={item._id}/>
          ))
        }
      </div>
    </div>
  );
};

export default AllServices;
