const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers }, ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'تعذّر إتمام الطلب. يرجى المحاولة لاحقاً.');
  return body;
}

export const getServices = () => request('/services');
export const getAvailability = (serviceId, date, type) => {
  const query = new URLSearchParams({ serviceId, date, type });
  return request(`/availability?${query}`);
};
export const createBooking = (booking) => request('/bookings', { method: 'POST', body: JSON.stringify(booking) });
