
import RightSide from '../ForgotPassword/rightSide';
import LeftSide from '../LeftSide/LeftSide';

import forgPassPhot from '../../assets/لقطة شاشة 2025-07-26 184056.png';



function ForgetPassword () {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Left side - Forget Password form */}

        <LeftSide head = "Forget Password ?" image = {forgPassPhot} />


        {/* Right side - Forget Password form */}
        <RightSide />
      </div>
    </div>
  );
}

export default ForgetPassword;