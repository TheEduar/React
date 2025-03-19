import React, { useContext, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrdersContext } from './OrdersContext';
import { App } from '@capacitor/app'; // Plugin Capacitor para manejar herramientas móviles
import '../../css/Orders/orders_details.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useContext(OrdersContext);
  const order = orders.find((pedido) => pedido.id === parseInt(id));

  // Manejo de la nagevación en movil
  useEffect(() => {
    

    const registerBackButtonListener = async () => {
      const listener = await App.addListener('backButton', (event) => {
        event.preventDefault();
        navigate('/');
      });

      // Eliminar el evento
      return () => {
        if (listener && typeof listener.remove === 'function') {
          listener.remove(); // Eliminar correctamente el listener
        }
      };
    };

    const cleanup = registerBackButtonListener();

    // Limpieza al desmontar el componente
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [navigate]);

  // Calcular totales
  const { lineItemsTotal, feeLinesTotal, shippingTotal, orderTotal } = useMemo(() => {
    if (!order) return { lineItemsTotal: 0, feeLinesTotal: 0, shippingTotal: 0, orderTotal: 0 };

    const lineItemsTotal = order.line_items.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
    const feeLinesTotal = order.fee_lines.reduce((acc, fee) => acc + parseFloat(fee.total || 0), 0);
    const shippingTotal = parseFloat(order.shipping_lines[0]?.total || 0);
    return { lineItemsTotal, feeLinesTotal, shippingTotal, orderTotal: lineItemsTotal + feeLinesTotal + shippingTotal };
  }, [order]);

  if (!order) return <p>No se encontró el pedido.</p>;

  const BillingShippingInfo = ({ title, data }) => (
    <div className="column">
      <h3>{title}</h3>
      {Object.entries(data).map(([label, value]) => (
        <p key={label}>
          <strong>{label}:</strong> {value || 'N/A'}
        </p>
      ))}
    </div>
  );

  return (
    <div className="order-details">
      {/* Encabezado del pedido */}
      <div className="order-header">
        <h2>Pedido #{order.id}</h2>
        <p className="order-date">{new Date(order.date_created).toLocaleDateString()}</p>
      </div>

      {/* Información de facturación y envío */}
      <div className="order-row">
        <BillingShippingInfo
          title="Datos de Envío"
          data={{
            Dirección: order.billing.address_1,
            Ciudad: order.billing.city,
            Estado: order.billing.state,
            País: order.billing.country,
          }}
        />
        <BillingShippingInfo
          title="Facturación"
          data={{
            Nombre: `${order.billing.first_name} ${order.billing.last_name}`,
            // Validación de la identificación
            Documento: order.created_via === "woomelly_mercadolibre"
            ? order.meta_data.find(meta => meta.key === '_wm_billing_info')?.value?.doc_number || 'N/A'
            : order.meta_data.find(meta => meta.key === 'cedula2')?.value || 'N/A',
            Teléfono: order.billing.phone || 'No registrado',
            Correo: order.billing.email || 'No registrado',
          }}
        />
      </div>

      {/* Lista de productos */}
      <div className="order-items">
        <h3>Productos del Pedido</h3>
        <div className="product-list">
          {order.line_items.map((item) => (
            <div className="product-item" key={item.id}>
              <img src={item.image?.src} alt={item.name} className="product-thumbnail" />
              <div>
                <p><strong>{item.name}</strong></p>
                <p>SKU: {item.sku}</p>
                <p>Cantidad: {item.quantity}</p>
                <p>Precio Total: {parseFloat(item.total).toLocaleString()} {order.currency}</p>
              </div>
            </div>
          ))}

          {order.fee_lines.map((fee) => (
            <div className="product-item fee-item" key={fee.id}>
              <div>
                <p><strong>{fee.name}</strong></p>
                <p>Total: {parseFloat(fee.total).toLocaleString()} {order.currency}</p>
              </div>
            </div>
          ))}

          <div className="shipping-info">
            <h4>Envío</h4>
            <p><strong>Método:</strong> {order.shipping_lines[0]?.method_title || 'N/A'}</p>
            <p><strong>Costo:</strong> {shippingTotal.toLocaleString()} {order.currency}</p>
          </div>
        </div>
      </div>

      {/* Totales del pedido */}
      <div className="order-totals">
        <h3>Totales</h3>
        <p><strong>Subtotal:</strong> {(lineItemsTotal + feeLinesTotal).toLocaleString()} {order.currency}</p>
        <p><strong>Envío:</strong> {shippingTotal.toLocaleString()} {order.currency}</p>
        <p><strong>Total:</strong> {orderTotal.toLocaleString()} {order.currency}</p>
      </div>

      {/* Nota final del pedido */}
      <div className="order-note">
        <p>
          <strong>Origen del pedido:</strong>{" "}
          {order.created_via === "woomelly_mercadolibre" ? "Mercado Libre" : "Don Repuestos"}
        </p>
      </div>

      {/* Botón flotante para regresar */}
      <button 
        onClick={() => navigate('/')} 
        className="floating-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon" width="30" height="30" fill="var(--dark-blue)" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H3.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L3.707 7.5H14.5a.5.5 0 0 1 .5.5z"/>
        </svg>
      </button>
    </div>
  );
};

export default OrderDetails;
