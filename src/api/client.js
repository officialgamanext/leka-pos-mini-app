const BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}, sessionToken) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

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

export const businessApi = {
  create: (name, token) => apiCall('/business', { method: 'POST', body: JSON.stringify({ name }) }, token),
  list: (token) => apiCall('/businesses', {}, token),
};

export const catalogApi = {
  createCategory: (businessId, name, token) => apiCall('/category', { method: 'POST', body: JSON.stringify({ businessId, name }) }, token),
  createItem: (businessId, itemData, token) => apiCall('/item', { method: 'POST', body: JSON.stringify({ businessId, ...itemData }) }, token),
};

export const billsApi = {
  create: (businessId, billData, token) => apiCall('/bill', { 
    method: 'POST', 
    body: JSON.stringify({ businessId, ...billData }) 
  }, token),
};

export const reportsApi = {
  getSummary: (businessId, range, token) => apiCall(`/reports?businessId=${businessId}&range=${range}`, {}, token),
  getCustom: (businessId, start, end, token) => apiCall(`/reports?businessId=${businessId}&range=custom&startDate=${start}&endDate=${end}`, {}, token),
};
