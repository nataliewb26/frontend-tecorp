import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import StoreNavbar from "../components/layout/StoreNavbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <>
      {isAdminPage ? (
        <Navbar />
      ) : (
        <div className="store">
          <StoreNavbar />
        </div>
      )}
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
