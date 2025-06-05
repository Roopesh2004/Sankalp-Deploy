import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { Login } from '../pages/Login';
import { StudentDashboard } from '../pages/StudentDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { useAuth } from '../context/AuthContext';

const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Login />;
  return user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

function GetStarted() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default GetStarted;