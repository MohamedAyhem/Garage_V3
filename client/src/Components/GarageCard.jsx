import React from "react";
import { Link } from "react-router-dom";
const GarageCard = ({ img, title, fn1, id, distance }) => {
  console.log("GarageCard ID:", id);

  const formatDistance = (dist) => {
    if (!dist) return null;
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m away`;
    }
    return `${dist.toFixed(1)}km away`;
  };

  return (
    <div className="bg-[#1B252F] rounded my-5 py-5 px-5  flex  flex-col gap-5">
      <img src={img} className="none w-[100%] rounded" alt="" />
      <div className="flex flex-row w-[100%]">
        <Link to={`/garage/${id}`} className="w-[100%]">
          <div className="w-[70%]">
            <p className="text-sm sm:text-base">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-300">4.8 (120 reviews)</p>
              {distance && (
                <span className="text-xs bg-[#FFDE01] text-black px-2 py-0.5 rounded font-semibold">
                  {formatDistance(distance)}
                </span>
              )}
            </div>
          </div>
        </Link>
        <button
          onClick={fn1}
          className="bg-[#FFDE01] text-black text-sm sm:text-base  w-[30%] h-[40px]   rounded cursor-pointer font-bold"
        >
          Reserve
        </button>
      </div>
    </div>
  );
};

export default GarageCard;
