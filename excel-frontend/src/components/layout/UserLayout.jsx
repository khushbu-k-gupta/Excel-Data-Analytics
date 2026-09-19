import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const UserLayout = () => {
  const { pathname } = useLocation();

  // Footer sirf Landing pe — app screens (dashboard/analytics) clean rehte hain
  // Login/Register apna AuthLayout use karte hain (standalone)
  const showFooter = pathname === '/';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default UserLayout;