import { Outlet } from "react-router-dom";
import NavBar from './../Templates/navigation';

const Layout = () => {
  return (
     <div className="flex flex-col min-h-screen w-full" style={{
       background: 'var(--bg-primary)',
       color: 'var(--text-primary)'
     }}>
      <NavBar />
      <main className="flex-1 w-full">
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};  
export default Layout;
