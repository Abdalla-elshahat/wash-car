import { useState } from "react";
import { CiLock } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { MdAlternateEmail } from "react-icons/md";
import { ToastContainer } from "react-toastify";
import { IoMdEyeOff } from "react-icons/io";

import { IoEye } from "react-icons/io5";
import { changePassword } from "../../apicalls/auth";
export default function RightSide() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(true);
  const [showc, setShowc] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="w-full md:w-3/5 px-4 md:px-0 mt-8">
           <ToastContainer />
      <div className="max-w-md mx-auto">
        <p className="text-gray-500 text-[18px] sm:text-[21px]">
          Your new password must be different from your{" "}
          <span className="sm:block text-center">previously used password</span>
        </p>

        <form className="space-y-6 mt-5" onSubmit={(e)=>changePassword(e,confirmpassword, password, email, setError, setLoading, navigate)}>
          <div className="relative">
            <label htmlFor="Email" className="block text-md font-bold text-[#939393] mb-2">
              Email
            </label>
            <MdAlternateEmail className="text-[17px] absolute left-3 top-[45px] text-gray-800" />
            <input
              type="email"
              id="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Your Email"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-md font-bold text-[#939393] mb-2">
              New Password
            </label>
            <CiLock className="text-[17px] absolute left-3 top-[45px] text-gray-800" />
            <input
             type={show ? "password" : "text"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Your Password"
              required
            />
            <span>
                          {show ?
                            <IoMdEyeOff className="text-[17px] absolute right-3 top-[45px] text-gray-800 cursor-pointer" onClick={() => setShow(!show)} /> :
                            <IoEye className="text-[17px] absolute right-3 top-[45px] text-gray-800 cursor-pointer" onClick={() => setShow(!show)} />}
                        </span>
          </div>

          <div className="relative">
            <label htmlFor="conpassword" className="block text-md font-bold text-[#939393] mb-2">
              Confirm Password
            </label>
            <CiLock className="text-[17px] absolute left-3 top-[45px] text-gray-800" />
            <input
             type={showc ? "password" : "text"}
              id="conpassword"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm Your Password"
              required
            />
            <span>
              {showc ?
                <IoMdEyeOff className="text-[17px] absolute right-3 top-[45px] text-gray-800 cursor-pointer" onClick={() => setShowc(!showc)} /> :
                <IoEye className="text-[17px] absolute right-3 top-[45px] text-gray-800 cursor-pointer" onClick={() => setShowc(!showc)} />}
            </span>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 mt-5 border border-transparent rounded-full shadow-sm text-md font-medium text-[18px] text-white bg-[#4169E1] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
