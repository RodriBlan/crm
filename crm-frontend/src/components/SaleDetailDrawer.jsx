import { Drawer, StatusBadge, fmtMoney } from "./ui";

export default function SaleDetailDrawer({ sale, onClose }) {
  if (!sale) return null;

  return (
    <Drawer
      title={`Venta #${sale.id}`}
      subtitle={`${sale.clientName ?? "Cliente"} · ${new Date(sale.date).toLocaleDateString("es-AR")}`}
      onClose={onClose}
    >
      <div className="detail-summary">
        <StatusBadge status={sale.status} />
        <strong className="detail-total">{fmtMoney(sale.total)}</strong>
      </div>

      {sale.notes && (
        <section className="detail-note">
          <span>Notas</span>
          <p>{sale.notes}</p>
        </section>
      )}

      <section className="detail-section">
        <div className="detail-section-heading">
          <span>Productos</span>
          <small>{sale.items?.length ?? 0} items</small>
        </div>
        <div className="detail-item-list">
          {sale.items?.map((item) => (
            <div className="detail-item" key={item.id}>
              <div>
                <strong>{item.productName}</strong>
                <span>{item.quantity} x {fmtMoney(item.unitPrice)}</span>
              </div>
              <b>{fmtMoney(item.subtotal)}</b>
            </div>
          ))}
        </div>
      </section>
    </Drawer>
  );
}
