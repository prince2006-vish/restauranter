import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Admin State
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('mp_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('mp_admin_token') || '');

  // Customer State
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('mp_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('mp_customer_token') || '');

  // Admin Actions
  const adminLogin = async (username, password) => {
    const res = await api.post('/auth/admin/login', { username, password });
    if (res.data.success) {
      setAdmin(res.data.admin);
      setAdminToken(res.data.token);
      localStorage.setItem('mp_admin_user', JSON.stringify(res.data.admin));
      localStorage.setItem('mp_admin_token', res.data.token);
    }
    return res.data;
  };

  const adminLogout = () => {
    setAdmin(null);
    setAdminToken('');
    localStorage.removeItem('mp_admin_user');
    localStorage.removeItem('mp_admin_token');
  };

  // Customer Actions
  const customerLogin = async (email, password) => {
    const res = await api.post('/auth/customer/login', { email, password });
    if (res.data.success) {
      setCustomer(res.data.customer);
      setCustomerToken(res.data.token);
      localStorage.setItem('mp_customer_user', JSON.stringify(res.data.customer));
      localStorage.setItem('mp_customer_token', res.data.token);
    }
    return res.data;
  };

  const customerRegister = async (userData) => {
    const res = await api.post('/auth/customer/register', userData);
    if (res.data.success) {
      setCustomer(res.data.customer);
      setCustomerToken(res.data.token);
      localStorage.setItem('mp_customer_user', JSON.stringify(res.data.customer));
      localStorage.setItem('mp_customer_token', res.data.token);
    }
    return res.data;
  };

  const customerLogout = () => {
    setCustomer(null);
    setCustomerToken('');
    localStorage.removeItem('mp_customer_user');
    localStorage.removeItem('mp_customer_token');
  };

  const updateCustomerProfile = (updatedCustomer) => {
    setCustomer(updatedCustomer);
    localStorage.setItem('mp_customer_user', JSON.stringify(updatedCustomer));
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        adminToken,
        isAdminAuthenticated: Boolean(adminToken && admin),
        adminLogin,
        adminLogout,
        customer,
        customerToken,
        isCustomerAuthenticated: Boolean(customerToken && customer),
        customerLogin,
        customerRegister,
        customerLogout,
        updateCustomerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
