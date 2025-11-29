import React from "react";

const Footer = () => {
  return (
    <div className="bg-[#1A1A1A] py-10 px-10 w-[100%]  md:h-[90vh] text-white">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-20">
        <div className="text-center md:text-left">
          <p className="font-bold text-xl mb-5">Contact Us Today</p>
          <p>
            <i class="fa-solid fa-phone-flip mr-5 text-md mb-5"></i>07960 747
            121
          </p>
          <p>
            <i class="fa-solid fa-phone-flip mr-5 text-md mb-5"></i>07960 747
            222{" "}
          </p>
          <div className="flex items-center gap-5 mb-5">
            <i class="fa-solid fa-map"></i>
            <div className="flex flex-col gap-2">
              <p>12 Bramber Road</p>
              <p>West Kensington</p>
              <p>W14 9PB, London</p>
            </div>
          </div>
          <div>
            <i class="fa-solid fa-envelope mr-5 mb-5"></i>
            info@perfectcargarage.co.uk
          </div>
          <div>
            <i class="fa-solid fa-envelope mr-5 mb-5"></i>
            office@perfectcargarage.co.uk
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <img src="logo.png" className="w-60 lg:w-[100%]" alt="" />
          <p className="my-10 text-md">Remapping, Diagnostics, Service and Repair</p>
          <div className="flex flex-row items-center gap-10 lg:gap-20 text-4xl cursor-pointer">
            <i class="fa-brands fa-square-facebook"></i>
            <i class="fa-brands fa-square-x-twitter"></i>
            <i class="fa-brands fa-youtube"></i>
            <i class="fa-brands fa-square-instagram"></i>
          </div>
        </div>

        <div className="flex  flex-col text-center md:text-right gap-2">
          <p className="font-bold text-xl mb-5">Opening Times</p>
          <p>Monday: 10am - 6pm</p>
          <p>Tuesday: 10am - 6pm</p>
          <p>Wednesday: 10am - 6pm</p>
          <p>Thursday: 10am - 6pm</p>
          <p>Friday: 10am - 6pm</p>
          <p>Saturday: 10am - 2pm (booking preferred)</p>
          <p>Sunday: closed</p>
        </div>
      </div>
      <div className="flex flex-col mt-20 justify-center items-center">
        <p>© 2025 Perfect Garage Ltd. All Rights Reserved.</p>
        <p>Created with Garage Invoice Professional</p>
      </div>
    </div>
  );
};

export default Footer;
