const STATUS_STYLES = {
  pendiente: { color: "#92400e", background: "#fef3c7" },
  pagado: { color: "#1d4ed8", background: "#dbeafe" },
  enviado: { color: "#6d28d9", background: "#ede9fe" },
  entregado: { color: "#166534", background: "#dcfce7" },
  cancelado: { color: "#991b1b", background: "#fee2e2" },
};

export default function OrderStatusBadge({ estado }) {
  const normalizedStatus = String(estado || "pendiente").toLowerCase();
  const label =
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
        ...STATUS_STYLES[normalizedStatus],
      }}
    >
      {label}
    </span>
  );
}
