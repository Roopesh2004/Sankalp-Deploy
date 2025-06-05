import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { Login } from '../pages/Login';
import { StudentDashboard } from '../pages/StudentDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';

const AuthenticatedApp: React.FC = () => {
  // Always show Login page - no authentication required
  return <Login />;
};

function GetStarted() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default GetStarted;