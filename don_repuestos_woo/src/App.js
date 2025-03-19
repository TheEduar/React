import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrdersProvider } from './components/Orders/OrdersContext'; // Contexto
import OrdersTables from './components/Orders/OrdersPreview';
import OrderDetails from './components/Orders/OrderDetails';

function App() {
  return (
    <OrdersProvider>
      {/* Incluyendo basename para que funcione en la subruta */}
      <Router basename="/woocommerce-don-repuestos">
        <div className="App">
          <Routes>
            <Route path="/" element={<OrdersTables />} />
            <Route path="/order/:id" element={<OrderDetails />} />
          </Routes>
        </div>
      </Router>
    </OrdersProvider>
  );
}

export default App;
