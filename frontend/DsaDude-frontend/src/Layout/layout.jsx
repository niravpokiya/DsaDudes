import { Outlet } from "react-router-dom"; 
import NavBar from './../Templates/navigation';
import Footer from './../Templates/footer';

const Layout = () => {
  return (
     <div className="flex flex-col min-h-screen bg-black text-gray-200 w-full">
     
      <div className="bg-[#111111] w-full h-full">
        <NavBar />
      </div>
 
      <main className="flex-1 bg-[#0a0a0a] w-full">
        <div>
          <Outlet />
        </div>
      </main>
 
     
    </div>
  );
};  
export default Layout;
