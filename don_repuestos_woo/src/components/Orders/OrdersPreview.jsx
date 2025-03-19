import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import getRecentOrders from '../../js/Get_orders';
import { OrdersContext } from './OrdersContext';
import '../../css/Orders/orders_preview.css';

const OrdersTables = () => {
  const { orders, setOrders, totalOrders, setTotalOrders } = useContext(OrdersContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const ORDERS_PER_PAGE = 10;
  const totalPages = useMemo(() => Math.ceil(totalOrders / ORDERS_PER_PAGE), [totalOrders]);

  // Función para cargar pedidos de un lote específico basado en la página
  const fetchOrdersBatch = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const batchPage = Math.ceil(page / 10);
      const batchStart = (batchPage - 1) * 100;
      const currentBatch = orders.slice(batchStart, batchStart + 100);

      if (currentBatch.length < 100) {
        const data = await getRecentOrders({ page: batchPage });
        setOrders((prevOrders) => [...prevOrders, ...data.orders]);
        setTotalOrders(data.total_orders);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orders, setOrders, setTotalOrders]);

  // Obtener los pedidos de la página actual de forma memoizada
  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [currentPage, orders]);

  // Cambio de pagina
  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      await fetchOrdersBatch(page);
      setCurrentPage(page);
    }
  };

  // Cargar el primer lote al montar el componente
  useEffect(() => {
    if (!orders.length) {
      fetchOrdersBatch(1);
    }
  }, [fetchOrdersBatch, orders.length]);

  return (
    <div className="recent-orders">
      <h2>Resumen de Pedidos</h2>
      <div className="orders-container">
        {isLoading && orders.length === 0 && <p>Cargando pedidos...</p>}
        {!isLoading &&
          currentOrders.map((pedido) => (
            <div
              key={pedido.id}
              className="single-order-preview"
              onClick={() => navigate(`/order/${pedido.id}`)}
            >
              <p><strong>Pedido #{pedido.id}</strong></p>
              <p>{pedido.billing?.first_name} {pedido.billing?.last_name}</p>
              <p><strong>Total:</strong> {pedido.total} {pedido.currency}</p>
            </div>
          ))}
      </div>

      <div className="pagination-controls">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Página Anterior
        </button>

        <span>Página <select value={currentPage} onChange={(e) => handlePageChange(Number(e.target.value))}>
          {Array.from({ length: totalPages }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>de {totalPages}</span>

        

        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          Página Siguiente
        </button>
      </div>
    </div>
  );
};

export default OrdersTables;
