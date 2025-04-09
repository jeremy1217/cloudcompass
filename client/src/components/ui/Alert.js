import React from 'react';
import { useAlert } from '../../context/AlertContext';

const Alert = () => {
  const { alerts } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`px-4 py-3 rounded-lg shadow-lg ${
            alert.type === 'error'
              ? 'bg-red-500 text-white'
              : alert.type === 'success'
              ? 'bg-green-500 text-white'
              : alert.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
};

export default Alert; 