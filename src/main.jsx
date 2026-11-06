import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import { CartProvider } from "./context/CartContext";

// Estilos base
import "./index.css";

// Estilos de la tienda
import "./styles/home/Home.css";
import "./styles/cart/CartDrawer.css";

// Estructura general
import "./styles/layout/Navbar.css";
import "./styles/layout/Footer.css";
import "./styles/global.css";

// Administración
import "./styles/admin/AdminDashboard.css";
import "./styles/admin/ProductManagement.css";

// Compras y pedidos
import "./styles/checkout/Checkout.css";
import "./styles/admin/OrderManagement.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <AppRouter />
    </CartProvider>
  </React.StrictMode>
);
