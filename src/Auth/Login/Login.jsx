
import RightSide from "../Login/RightSide";




import phot from '../../assets/لقطة شاشة 2025-07-26 184056.png';
import LeftSide from "../LeftSide/LeftSide";


function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Left side - Login form */}


        <LeftSide head = "Log in Now" text = "Very good works are waiting for you..." image = {phot} />




        {/* Right side - Login form */}
        <RightSide />
      </div>
    </div>
  );
}

export default Login;