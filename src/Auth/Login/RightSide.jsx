import { useContext, useEffect, useState } from "react";
import SocialLogin from "./../SignUp/SocialLogin";
import { MdOutlineEmail } from "react-icons/md";
import { CiLock } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { ToastContainer } from "react-toastify";
import { EmailContext } from "../../App";
import {Login} from "../../apicalls/auth"
function RightSide() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { Setemail } = useContext(EmailContext); // استخدام الكونتكست
  const navigate = useNavigate();
  useEffect(() => {

  }, [Login])
  return (
    <div className="w-full md:w-3/5 my-auto px-4 md:px-0">
       <ToastContainer />
      <div className="max-w-md mx-auto">
        <form className="space-y-6 mt-5" onSubmit={(e)=>Login(e,  password, email, setError, setLoading, Setemail, navigate)}>
          <div className="relative">
            <label htmlFor="email" className="block text-md font-bold text-[#939393] mb-2">
              Email
            </label>
            <MdOutlineEmail className="text-[17px] absolute left-3 top-[45px] text-gray-500" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Your Email"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-md font-bold text-[#939393] mb-2">
              Password
            </label>
            <CiLock className="text-[17px] absolute left-3 top-[45px] text-gray-800" />
            <input
              type={show ? "password" : "text"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Your Password"
              required
            />
            <span onClick={() => setShow(!show)}>
              {show ? (
                <IoMdEyeOff className="text-[17px] absolute right-3 top-[45px] text-gray-800 cursor-pointer" />
              ) : (
                <IoEye className="text-[17px] absolute right-3 top-[45px] text-gray-800 cursor-pointer" />
              )}
            </span>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex items-center justify-end">
            <Link to="/forgetpass" className="text-md text-[#454545] font-semibold">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-md font-medium text-white bg-[#4169E1] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
               <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">don't have an account? </span>
          <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-500">Signup</Link>
        </div>
        </form>
        {/* <SocialLogin /> */}
      </div>
    </div>
  );
}

export default RightSide;
