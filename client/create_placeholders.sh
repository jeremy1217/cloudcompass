#!/bin/bash

# Create context files
echo "import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;" > src/context/AuthContext.js

echo "import React, { createContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  
  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;" > src/context/AlertContext.js

# Create routing component
echo "import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // For testing, hardcode to true
  
  if (!isAuthenticated) {
    return <Navigate to='/login' />;
  }
  
  return children ? children : <Outlet />;
};

export default PrivateRoute;" > src/components/routing/PrivateRoute.js

# Create UI components
echo "import React from 'react';

const Alert = () => {
  return (
    <div>Alert Component</div>
  );
};

export default Alert;" > src/components/ui/Alert.js

# Create Layout components
echo "import React from 'react';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className='bg-gray-100 min-h-screen'>
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto py-6 px-4'>
          <h1 className='text-3xl font-bold text-gray-900'>CloudCompass</h1>
        </div>
      </header>
      <main>
        <div className='max-w-7xl mx-auto py-6 px-4'>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;" > src/components/layout/Dashboard.js

# Create auth page placeholders
echo "import React from 'react';

const Login = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <h2 className='text-center text-3xl font-extrabold text-gray-900'>Sign in to CloudCompass</h2>
        <p className='text-center'>Login placeholder page</p>
      </div>
    </div>
  );
};

export default Login;" > src/pages/auth/Login.js

for file in Register ForgotPassword ResetPassword; do
  echo "import React from 'react';

const $file = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <h2 className='text-center text-3xl font-extrabold text-gray-900'>$file</h2>
        <p className='text-center'>$file placeholder page</p>
      </div>
    </div>
  );
};

export default $file;" > src/pages/auth/$file.js
done

# Create dashboard page placeholders
for file in Overview Resources ResourceDetail Recommendations MigrationPlans MigrationPlanDetail Monitoring Settings Profile; do
  echo "import React from 'react';

const $file = () => {
  return (
    <div>
      <h2 className='text-2xl font-bold mb-4'>$file</h2>
      <p>$file placeholder content</p>
    </div>
  );
};

export default $file;" > src/pages/dashboard/$file.js
done

# Create admin page placeholders
for file in Users Settings; do
  echo "import React from 'react';

const $file = () => {
  return (
    <div>
      <h2 className='text-2xl font-bold mb-4'>Admin $file</h2>
      <p>Admin $file placeholder content</p>
    </div>
  );
};

export default $file;" > src/pages/admin/$file.js
done

# Create NotFound page
echo "import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold mb-4'>404 - Page Not Found</h2>
        <p className='mb-4'>The page you are looking for doesn't exist.</p>
        <Link to='/' className='text-blue-500 hover:underline'>Go Home</Link>
      </div>
    </div>
  );
};

export default NotFound;" > src/pages/NotFound.js
