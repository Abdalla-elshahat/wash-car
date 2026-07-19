
import LeftSide from '../LeftSide/LeftSide';
import RightSide from './../SignUp/RightSide';

import Signphot from '../../assets/لقطة شاشة 2025-07-26 184056.png';

function SignUp() {
  return (

<div className="min-h-screen bg-gray-50">

      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 pt-0 md:pt-[80px]">

        <div className="max-w-4xl w-full flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden bg-white">

        {/* Left side - Signup form */}
        <LeftSide head = "Sign up" text = "Create an account to join our community" image = {Signphot} />
        
        
        {/* Right side - Signup form */}
        <RightSide />

        </div>

      </div>

    </div>
  );
}

export default SignUp;