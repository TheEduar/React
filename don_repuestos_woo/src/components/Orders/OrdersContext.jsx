import React, { createContext, useState, useMemo } from 'react';

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]); //Almacenar los datos de los pedidos
  const [totalOrders, setTotalOrders] = useState(0); // Total de pedidos disponibles

  // Que sea redundantw para evitar cargas
  const contextValue = useMemo(() => ({
    orders,
    setOrders,
    totalOrders,
    setTotalOrders,
  }), [orders, totalOrders]);

  return(
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
  
};