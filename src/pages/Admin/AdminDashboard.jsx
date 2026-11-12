
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  Tags,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    title: "Productos",
    description: "Crear, editar, buscar y eliminar productos.",
    icon: Package,
    path: "/admin/productos",
    action: "Gestionar productos",
  },
  {
    title: "Categorías",
    description: "Organizar las categorías de la tienda.",
    icon: Tags,
    path: "/admin/categorias",
    action: "Gestionar categorías",
  },
  {
    title: "Pedidos",
    description: "Consultar compras y actualizar estados.",
    icon: ShoppingCart,
    path: "/admin/pedidos",
    action: "Gestionar pedidos",
  },
  {
    title: "Clientes",
    description: "Consultar información de clientes.",
    icon: Users,
    path: "/admin",
    action: "Próximamente",
  },
];

export default function AdminDashboard() {
  return (
    <section className="admin-page">
      <div className="admin-heading">
        <span className="eyebrow">
          TECORP STORE / PANEL ADMINISTRATIVO
        </span>

        <h1>Panel de administración</h1>

        <p>
          Gestiona los recursos principales de tu tienda virtual.
        </p>
      </div>

      <div className="admin-grid">
        {modules.map(
          ({ title, description, icon: Icon, path, action }) => (
            <article className="admin-module" key={title}>
              <Icon size={30} />

              <h2>{title}</h2>

              <p>{description}</p>

              <Link className="admin-module-link" to={path}>
                {action}
                <ArrowRight size={15} />
              </Link>
            </article>
          )
        )}
      </div>

      <Link to="/" className="back-link">
        Volver a la tienda
      </Link>
    </section>
  );
}
