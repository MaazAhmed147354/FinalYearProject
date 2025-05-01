import React, { useState } from "react";
// import { ReactComponent as Google } from "../assets/images/google.svg"; 
import { ReactComponent as QaviLogo } from "../assets/images/qaviLogo.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
import axios from "axios"; 

const LoginPage = ({ setAuthenticated }) => { 
  const [email, setEmail] = useState(""); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/dev/loginUser", { email }, { withCredentials: true });

      const { redirectUrl } = response.data;
      dispatch(setUser({ email }));

      setAuthenticated(true);
      navigate(redirectUrl); // Use the redirect URL from the response
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  


return (
    <div className="grid grid-cols-[4fr_2fr] h-screen">
      <div className="h-full flex flex-col bg-[#FFA200] pl-32">
        <div className="w-full pt-12">
          <QaviLogo />
        </div>
        <div className="flex flex-col gap-3 justify-center w-full h-[520px] text-[#14213D] font-inter ">
          <div className="text-[80px] flex flex-col space-y-[-26px] font-bold ">
            <span>Hello </span>
            <span>Qavians!</span>
          </div>
          <p className="font-inter leading-5 font-medium text-[16px] w-[600px] ">
            Lorem Ipsum has been the industry's standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </p>
        </div>
      </div>
      <div className="h-full flex flex-col justify-center items-center px-6">
        <div className="flex flex-col gap-4 justify-center items-center text-[#14213D] w-[450px]">
          <div className="text-center">
            <h3 className="text-[36px] font-bold">Welcome!</h3>
            <p className="text-[#2B3750] text-[14px] font-medium">
              Use your official company email to login for secure access to Q-Reviews.
            </p>
          </div>
          
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            className="border-2 border-[#22222284] rounded-lg w-full py-2 px-4"
            required
          />

          <div
            className="my-4 border-2 border-[#22222284] bg-white rounded-lg w-full py-2 cursor-pointer flex items-center justify-center px-4 hover:bg-[#e1e0e0]"
            onClick={handleLogin} 
          >
            <h4 className="font-semibold text-md text-gray-700 ml-2">
              Login
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
