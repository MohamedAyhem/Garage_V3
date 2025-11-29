import React from "react";

const Section = () => {
  return (
    <div className="flex flex-col pt-10 px-10 justify-between border-b-[25px] border-b-[#FFDE01]  bg-[#1A1A1A] w-[100%] h-[250vh] sm:flex-row gap-10 ">
      <div>
        <p className="text-[#FFED01] text-xl">We Can Fix It</p>
        <h1 className="text-white font-bold text-5xl">ANY MAKE</h1>
        <h1 className="text-white font-bold text-5xl">ANY MODEL</h1>
        <div className="mt-10 mb-20">
          <button className="bg-[#FFDE01] py-5 px-5 text-black cursor-pointer text-xl font-bold hover:bg-black hover:text-[#FFDE01] mr-5 mt-5">
            Book Online <i class="fa-solid fa-forward"></i>
          </button>
          <button className="bg-[#FFDE01] py-5 px-5 text-black cursor-pointer text-xl font-bold hover:bg-black hover:text-[#FFDE01] mr-5 mt-5">
            <i class="fa-solid fa-phone-flip"></i> Call Us:07960747121
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-10 mt-10">
          <div className="flex justify-center items-center">
            <img
              src="Mercedes.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
          <div className="flex justify-center items-center">
            <img
              src="BMW.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
          <div className="flex justify-center items-center">
            <img
              src="Audi.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
          <div className="flex justify-center items-center">
            <img
              src="LandRover.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
          <div className="flex justify-center items-center">
            <img
              src="Mazda.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
          <div className="flex justify-center items-center">
            <img
              src="Honda.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
          <div className="flex justify-center items-center">
            <img
              src="Ford.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
          <div className="flex justify-center items-center">
            <img
              src="Fiat.png"
              alt=""
              className="filter grayscale hover:grayscale-0 transition duration-300"
            />
          </div>
        </div>
      </div>
      <img src="bb.jpeg" className="w-[100%] lg:w-auto" alt="" />
    </div>
  );
};

export default Section;
