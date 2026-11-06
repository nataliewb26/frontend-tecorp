import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route element={<MainLayout />}>
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productos" element={<ProductManagement />} />
          <Route path="/admin/pedidos" element={<OrderManagement />} />
        </Route>

        <Route path="*" element={<main style={{ padding: 40 }}>Página no encontrada.</main>} />
      </Routes>
    </BrowserRouter>
  );
}