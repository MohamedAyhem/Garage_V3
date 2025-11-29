import React from 'react'

const Features = () => {
  return (
    <div className='flex  flex-col gap-10 sm:flex-row py-20 px-20 lg:px-50 mt-16 sm:mt-7  lg:mt-18 justify-between border-b-[25px] border-b-[#FFDE01] bg-[#1A1A1A] w-[100%] text-white z-20'>
        <div className='flex flex-col text-center items-center leading-7'>
            <img src="Clock-1.svg" alt=""  className='w-15 py-5'/>
            <h2 className='font-bold text-xl'>OPENING TIMES</h2>
            <p>Mon To Fri: 10am - 6pm</p>
            <p>Saturdays: 10am - 2pm</p>
            <p>Sundays: Closed</p>
        </div>
        <div className='flex flex-col text-center items-center leading-7'>
            <img src="Man-1.svg" alt="" className='w-15 py-5' />
            <h2 className='font-bold text-xl'>PROFESSIONAL TEAM</h2>
            <p>Fully Trained Staff</p>
        </div>
        <div className='flex flex-col text-center items-center leading-7'>
            <img src="Star1.svg" alt="" className='w-15 py-5' />
            <h2 className='font-bold text-xl'>QUALITY SERVICE</h2>
            <p>No Job is To Small</p>
        </div>
    </div>
  )
}

export default Features