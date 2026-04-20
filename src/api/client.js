const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}, sessionToken) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    console.error(`API Error [${response.status}] ${response.url}:`, data);
    throw new Error(typeof data === 'string' ? data : (data.message || data.error || 'API call failed'));
  }

  return data;
};

// ── Business ──────────────────────────────────────────────────
export const businessApi = {
  create: (name, token) => apiCall('/business', { method: 'POST', body: JSON.stringify({ name }) }, token),
  list:   (token)       => apiCall('/businesses', {}, token),
};

// ── Catalog ───────────────────────────────────────────────────
export const catalogApi = {
  createCategory: (businessId, name, token)      => apiCall('/category', { method: 'POST', body: JSON.stringify({ businessId, name }) }, token),
  createItem:     (businessId, itemData, token)  => apiCall('/item',     { method: 'POST', body: JSON.stringify({ businessId, ...itemData }) }, token),
};

// ── Staff ─────────────────────────────────────────────────────
export const staffApi = {
  list:   (businessId, token)                      => apiCall(`/staff?businessId=${businessId}`, {}, token),
  add:    (businessId, staffUserId, role, token)   => apiCall('/staff', { method: 'POST', body: JSON.stringify({ businessId, staffUserId, role }) }, token),
  remove: (staffId, businessId, token)             => apiCall(`/staff/${staffId}?businessId=${businessId}`, { method: 'DELETE' }, token),
};

// ── Bills ─────────────────────────────────────────────────────
export const billsApi = {
  create: (businessId, billData, token) => apiCall('/bill', { method: 'POST', body: JSON.stringify({ businessId, ...billData }) }, token),
  list:   (businessId, range = 'today', token) => apiCall(`/bills?businessId=${businessId}&range=${range}`, {}, token),
  listCustom: (businessId, startDate, endDate, token) =>
    apiCall(`/bills?businessId=${businessId}&range=custom&startDate=${startDate}&endDate=${endDate}`, {}, token),
};

// ── Investments / Expenses ────────────────────────────────────
export const investmentsApi = {
  get:    (businessId, range = 'thisMonth', token)   => apiCall(`/investments?businessId=${businessId}&range=${range}`, {}, token),
  getCustom: (businessId, start, end, token)          => apiCall(`/investments?businessId=${businessId}&range=custom&startDate=${start}&endDate=${end}`, {}, token),
  create: (businessId, data, token)                  => apiCall('/investment', { method: 'POST', body: JSON.stringify({ businessId, ...data }) }, token),
  delete: (id, businessId, token)                    => apiCall(`/investment/${id}?businessId=${businessId}`, { method: 'DELETE' }, token),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  get: (businessId, range = 'today', token)              => apiCall(`/dashboard?businessId=${businessId}&range=${range}`, {}, token),
  getCustom: (businessId, startDate, endDate, token)     => apiCall(`/dashboard?businessId=${businessId}&range=custom&startDate=${startDate}&endDate=${endDate}`, {}, token),
};

// ── Reports ───────────────────────────────────────────────────
export const reportsApi = {
  getSummary: (businessId, range, token)          => apiCall(`/reports?businessId=${businessId}&range=${range}`, {}, token),
  getCustom:  (businessId, start, end, token)     => apiCall(`/reports?businessId=${businessId}&range=custom&startDate=${start}&endDate=${end}`, {}, token),
};
