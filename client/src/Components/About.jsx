import React from 'react'

const About = () => {
  return (
    <div className='bg-[#1A1A1A] h-[250vh] border-b-[25px] border-b-[#FFDE01]  w-[100%] py-20 px-10 flex flex-col md:flex-row justify-between items-center gap-10 '>
      <img src="car2.jpg" alt="" className='w-[400px] lg:w-[500px]' />
      <div>
        <p className='text-[#FFDE01] text-xl'>Welcome To</p>
        <h1 className='text-white text-5xl mb-20 font-bold'>Perfect Garage Ltd</h1>
        <div className='mb-20'>
          <p className='text-white font-bold'>WHO WE ARE</p>
          <p className='text-white w-[90%]'>With more than 20 years of experience in the field (20 Mechanical and 12 in remapping and advance diagnostics),
            we know our industry like the back of our hands.
            There’s no challenge too big or too small, and we dedicate our utmost energy to every customer, large or small.</p>
        </div>
        <div>
          <p className='text-white font-bold'>WHAT WE DO</p>
          <p className='text-white w-[90%]'>With more than 20 years of experience in the field (20 Mechanical and 12 in remapping and advance diagnostics),
            we know our industry like the back of our hands. There’s no challenge too big or too small,
            and we dedicate our utmost energy to every customer, large or small.</p>
        </div>

      <button className='bg-[#FFDE01]  text-black font-bold hover:bg-[#1A1A1A] hover:text-[#FFDE01] text-xl py-3 rounded px-5 mt-20 cursor-pointer'>About Us <i class="fa-solid fa-forward ml-5"></i></button>
      </div>
      
    </div>
  )
}

export default About