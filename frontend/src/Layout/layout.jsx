import { Outlet } from "react-router-dom";
import NavBar from './../Templates/navigation';

const Layout = () => {
  return (
     <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default Layout;
