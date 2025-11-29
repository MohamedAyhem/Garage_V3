import React from "react";
import OurServices from "../Components/OurServices";
import ServicesList from "../Components/Services";
import Footer from "../Components/Footer";
import AllServices from "../Components/AllServices";

const Services = () => {
  return (
    <div className="flex flex-col w-[100%] h-[450px] bg-[url('/Background2.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 z-0 h-[450px]"></div>
      <div className="text-center relative mx-auto italic mt-80 sm:pr-10 lg:pr-20">
        <h1 className="text-[#FFDE01]">OUR</h1>
        <h1 className="text-white font-bold text-5xl sm:text-6xl lg:text-8xl">
          SERVICES
        </h1>
      </div>
      <AllServices />

      <div className="relative flex flex-col items-center justify-center md:justify-between gap-10 md:flex-row mx-auto italic mt-0 w-[100%] border-b-[25px] border-t-[25px] py-20 px-10 border-t-[#FFDE01] border-b-[#FFDE01] bg-[#1A1A1A] h-[200vh]">
        <img src="S1.jpg" className="w-[100%] md:w-[45%] h-auto" alt="" />
        <div className="w-[100%] md:w-[50%]">
          <p className="text-[#FFDE01] text-xl">Perfect Garage Ltd</p>
          <h1 className="text-white text-5xl mb-20 font-bold">
            HIGH QUALITY SERVICES
          </h1>
          <p className="text-white text-xl mb-5">
            We offer car repairs in London at an affordable price. We work with
            a number of suppliers to make sure we can fix your car to a high
            standard.
          </p>
          <p className="text-white text-xl mb-5">
            Our highly qualified technicians have vast knowledge of a wide range
            of vehicles. We will undertake all types of work, no matter how big
            or small.
          </p>
          <p className="text-white text-xl mb-5 font-bold">
            We are fully equipped to tackle any mechanical repair, from fitting
            a new bulb to replacing an entire engine.
          </p>
          <button className="bg-[#FFDE01] text-black font-extrabold hover:bg-[#1A1A1A] hover:text-[#FFDE01] text-xl py-3 rounded px-5 mt-8 cursor-pointer">
            Book Online <i class="fa-solid fa-forward ml-5"></i>
          </button>
        </div>
      </div>

      {/* <OurServices /> */}
      <Footer />
    </div>
  );
};

export default Services;
