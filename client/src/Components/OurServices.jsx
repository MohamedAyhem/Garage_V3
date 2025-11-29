import React from "react";

const OurServices = () => {
  return (
    <div className="bg-[#1B252F] py-20 px-10 w-[100%] h-[700vh] border-b-[25px] border-b-[#FFDE01]">
      <p className="text-[#FFDE01] text-2xl italic">POPULAR</p>
      <div className="flex flex-col justify-between items-center gap-10 sm:flex-row mt-10">
        <h1 className="text-white text-5xl lg:text-5xl font-bold">
          SERVICES
        </h1>
        <hr className="text-[#FFDE01] w-[70%]" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10 border-b-2 py-10 border-b-[#FFDE01]">
        <img src="Diagnostics.jpg" className="w-[100%] md:w-[70%]" alt="" />
        <div className="w-[100%] md:w-[60%]">
          <h1 className="text-[#FFDE01] text-4xl font-bold">
            VEHICLE DIAGNOSTICS
          </h1>
          <p className="text-white my-10 text-xl leading-8">
            If you’re looking for accurate vehicle and engine diagnostic
            services, look no further than our garage in London. We use the
            latest vehicle diagnostic equipment to trace and rectify faults with
            your car’s engine or electrical systems. As soon as you see an
            illuminated warning light on your dashboard, bring your vehicle to
            our experienced team for advanced diagnostic services.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10 border-b-2 py-10 border-b-[#FFDE01]">
        <div className="w-[100%] md:w-[60%]">
          <h1 className="text-[#FFDE01] text-4xl font-bold">VEHICLE REPAIR</h1>
          <p className="text-white my-10 text-xl leading-8">
            We don't believe that your car should cost you a fortune when it
            needs repairing. At Perfect Garage Ltd we make sure your costs
            remain low, but the work is of a high standard. Regardless of the
            size or complexity of the job, we can take care of everything for
            you; from a blown bulb to a complete engine or chassis rebuild. All
            the materials, items and parts used in the repair of your vehicle
            will be from trusted manufacturers and come with a guarantee so that
            you don't have to replace them time and time again.
          </p>
        </div>
        <img src="Repair.jpg" className="w-[100%] md:w-[70%]" alt="" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10 border-b-2 py-10 border-b-[#FFDE01]">
        <img src="Servicing.jpg" className="w-[100%] md:w-[70%]" alt="" />
        <div className="w-[100%] md:w-[60%]">
          <h1 className="text-[#FFDE01] text-4xl font-bold">CAR SERVICING</h1>
          <p className="text-white my-10 text-xl leading-8">
            Are you aware that servicing your car regularly is key to boosting
            the safety of the vehicle? A service doesn't just check that the
            vehicle is roadworthy, but also that it is safe. We can service your
            vehicle at an affordable price. It is important to regularly get
            your vehicle checked to avoid risk of breakdown and optimize the
            reliability of your vehicle.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10 py-10">
        <div className="w-[100%] md:w-[60%]">
          <h1 className="text-[#FFDE01] text-4xl font-bold">ECU REMAPPING</h1>
          <p className="text-white my-10 text-xl leading-8">
            We are Specialist in ECU Remapping, DPF & EGR delete and Vehicle
            Diagnostics and Coding Services throughout London area. ECU
            remapping will not only improve the engine's power and torque
            figures, it will also sharpen the throttle response and widen the
            power-band. This will make the power delivery a lot more linear,
            which in turn will make the vehicle feel livelier to drive and the
            engine more flexible.
          </p>
        </div>
        <img src="Remapping.jpg" className="w-[100%] md:w-[70%]" alt="" />
      </div>
      <div className="mt-10 mb-20 flex justify-center">
        <button className="bg-[#FFDE01] py-5 px-5 text-black cursor-pointer text-xl font-bold hover:bg-black hover:text-[#FFDE01] mr-5 mt-5">
          Book Online <i class="fa-solid fa-forward"></i>
        </button>
        <button className="bg-[#FFDE01] py-5 px-5 text-black cursor-pointer text-xl font-bold hover:bg-black hover:text-[#FFDE01] mr-5 mt-5">
          <i class="fa-solid fa-phone-flip"></i> Call Us:07960747121
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-10 mb-10 mt-10">
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
  );
};

export default OurServices;
