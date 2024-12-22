import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAuth } from "../slices/authSlice";
import { AppDispatch } from "../store/store";
import { Outlet } from "react-router-dom";

function Validate() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getAuth());
  }, [dispatch]);
  return <Outlet />;
}

export default Validate;
