const BASE_URL = 'https://donrepuestos.com/wp-json/wc/v3/orders';
const AUTHORIZATION_HEADER = `Basic ${process.env.REACT_APP_API_KEY}`;

/**
 * Obtiene los pedidos recientes.
 * @param {Object} params - Parámetros opcionales para la consulta.
 * @returns {Promise<Object>} - Pedidos y el total de pedidos.
 */
const getRecentOrders = async (params = {}) => {
  const queryParams = new URLSearchParams({
    orderby: 'date',
    order: 'desc',
    per_page: 100, // Límite de 100 pedidos por solicitud
    page: params.page || 1, // Página actual
    ...params,
  }).toString();

  const url = `${BASE_URL}?${queryParams}`;

  const headers = new Headers({
    Authorization: AUTHORIZATION_HEADER,
  });

  try {
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }

    const orders = await response.json();
    const totalOrders = parseInt(response.headers.get('x-wp-total') || 0, 10);

    return { orders, total_orders: totalOrders };
  } catch (error) {
    console.error('[Error al obtener los pedidos]', { message: error.message, stack: error.stack });
    throw error;
  }
};

export default getRecentOrders;
