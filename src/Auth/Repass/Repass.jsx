
import RightSide from "../Repass/RightSide";




import phot from '../../assets/لقطة شاشة 2025-07-26 184056.png';
import LeftSide from "../LeftSide/LeftSide";


function Repass() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Left side - Repass form */}


        <LeftSide head = "Create New Password"  image = {phot} />




        {/* Right side - Repass form */}
        <RightSide />
      </div>
    </div>
  );
}

export default Repass;