import React from 'react'
import { Link } from 'react-router-dom'

const Service = ({title,image,id}) => {
  return (
    <Link to={`/Service/${id}`} state={{ title, image }} className="relative cursor-pointer group border border-transparent hover:border-[#FFDE01] overflow-hidden w-full max-w-[460px] h-[260px]">
          <img
            src={image}
            alt=""
            className="group-hover:scale-110 w-full h-full object-cover transition-transform duration-300 ease-in-out"
          />
          <div className="absolute bottom-0 left-0 py-5 px-5 bg-[#FFDE01] bg-opacity-90 text-center">
            <p className="font-bold text-[16px] lg:text-xl">
              {title}
            </p>
          </div>
        </Link>
  )
}

export default Service