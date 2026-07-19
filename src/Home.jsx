import { Link } from 'react-router-dom';
import Navbar from './component/Navbar/Navbar';
import { token } from './utels/const';
function Home() {
  return (
    <>
    <Navbar/>
        <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen gap-6 p-4 bg-gray-100">
          {
            console.log(token)
          }
      <Link to="/clients" >
        <div className="w-60 h-60 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold flex justify-center items-center rounded-2xl shadow-lg cursor-pointer transition">
          العملاء
        </div>
      </Link>
      <Link to="/orders">
        <div className="w-60 h-60 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold flex justify-center items-center rounded-2xl shadow-lg cursor-pointer transition">
          الطلبات
        </div>
      </Link>
      <Link to="/services">
        <div className="w-60 h-60 bg-red-500 hover:bg-red-600 text-white text-2xl font-bold flex justify-center items-center rounded-2xl shadow-lg cursor-pointer transition">
          خدمات
        </div>
      </Link>
    </div>
    </>
  );
}

export default Home;
