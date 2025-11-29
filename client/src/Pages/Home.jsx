import React from "react";
import Features from "../Components/Features";
import ServicesList from "../Components/Services";
import About from "../Components/About";
import Section from "../Components/Section";
import Footer from "../Components/Footer";
const Home = () => {
  return (
    <div className="flex flex-col w-[100%] h-screen bg-[url('/Background.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="mt-70 md:mt-50 text-center relative mx-auto z-10 text-white italic font-bold  text-5xl md:text-8xl w-[100%] lg:w-[100%]">
        <h1>
          <span className="text-[#FFDE01]">RE</span>MAPS
        </h1>
        <h1>
          <span className="text-[#FFDE01]">DI</span>AGNOSTICS
        </h1>
        <h1>
          <span className="text-[#FFDE01]">RE</span>PAIR & SERVICES
        </h1>
      </div>
      <div className="group bg-[#1A1A1A] relative hover:bg-[#FFDE01]  z-10 animate-bounce w-[80px] mx-auto mt-10 hidden lg:mt-20 h-[80px] md:flex justify-center items-center cursor-pointer">
        <i class="fa-solid fa-chevron-down text-[#FFDE01] group-hover:text-[#1A1A1A] text-[50px]"></i>
      </div>
      <Features  />
      <ServicesList title1={"MOST POPULAR"} title2={"SERVICES"}/>
      <About />
      <Section />
      <Footer />
    </div>
  );
};

export default Home;
