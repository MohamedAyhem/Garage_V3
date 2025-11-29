import React from "react";
import useMyGarages from "../hooks/useMyGarages";
import MyGaragesView from "./MyGaragesView";

const MyGarages = () => {
  const hook = useMyGarages();
  return <MyGaragesView {...hook} />;
};

export default MyGarages;
