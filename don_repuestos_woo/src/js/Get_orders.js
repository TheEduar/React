const getRecentOrders = async (params = {}) => {
  const baseUrl = 'https://donrepuestos.com/wp-json/wc/v3/orders';

  const queryParams = new URLSearchParams({
    ...params,
    orderby: 'date',
    order: 'desc',
    per_page: 100, // Límite de 100 productos por solicitud
    page: params.page || 1, // Página actual
  }).toString();

  const url = `${baseUrl}?${queryParams}`;

  const headers = new Headers({
    'Authorization': 'Basic Y2tfYTU1ODM0NzU5NjYxOGFlYzBhOTFhZWY0OGY1MjViYzUzZWUwOTExZDpjc184OTE4MmM1ZTlkYTE4YzI5NGFlNjJjMzNmYmUxODJhY2YxZTkyYjkx',
  });

  try {
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    const orders = await response.json();
    const totalOrders = response.headers.get('x-wp-total'); // Total de pedidos disponibles

    return { orders, total_orders: parseInt(totalOrders, 10) };
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    throw error;
  }
};

export default getRecentOrders;
 