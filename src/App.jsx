import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import MemberDashboard from "./pages/MemberDashboard.jsx";
import ReceptionDashboard from "./pages/ReceptionDashboard.jsx";
import Index from "./pages/Index.jsx";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(userRole || '')) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, userRole, loading } = useAuth();
  
  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }
  
  // Redirect to appropriate dashboard based on role
  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'member':
        return '/member';
      case 'reception':
        return '/reception';
      default:
        return '/member'; // Default to member dashboard
    }
  };
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <Register />} 
      />
      <Route 
        path="/" 
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <Navigate to="/login" replace />} 
      />
      
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/member/*" 
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reception/*" 
        element={
          <ProtectedRoute allowedRoles={['reception']}>
            <ReceptionDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><div className="text-center"><h1 className="text-2xl font-bold text-gray-800">Unauthorized Access</h1><p className="text-gray-600">You don't have permission to access this page.</p></div></div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;