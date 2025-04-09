import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info', timeout = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const newAlert = { id, message, type };
    setAlerts((prev) => [...prev, newAlert]);

    setTimeout(() => {
      removeAlert(id);
    }, timeout);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
}; 