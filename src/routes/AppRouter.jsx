import { BrowserRouter, Navigate, Outlet, Routes, Route, useLocation } from "react-router-dom";
import App from "../App";
import MainLayout from "../layouts/MainLayout";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Checkout from "../pages/Checkout/Checkout";
import OrderConfirmation from "../pages/Checkout/OrderConfirmation";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ProductManagement from "../pages/Admin/ProductManagement";
import OrderManagement from "../pages/Admin/OrderManagement";
import CategoryManagement from "../pages/Admin/CategoryManagement";
import CustomerManagement from "../pages/Admin/CustomerManagement";
import MyOrders from "../pages/Checkout/MyOrders";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const { estaAutenticado, esAdmin } = useAuth();

  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}

function AuthenticatedRoute() {
  const { estaAutenticado } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <Outlet />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route element={<MainLayout />}>
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
          <Route element={<AuthenticatedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/mis-pedidos" element={<MyOrders />} />
          </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productos" element={<ProductManagement />} />
          <Route path="/admin/categorias" element={<CategoryManagement />} />
          <Route path="/admin/pedidos" element={<OrderManagement />} />
          <Route path="/admin/clientes" element={<CustomerManagement />} />
        </Route>
        </Route>

        <Route path="*" element={<main style={{ padding: 40 }}>Página no encontrada.</main>} />
      </Routes>
    </BrowserRouter>
  );
}
