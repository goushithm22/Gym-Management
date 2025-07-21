
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
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
  const { user, userRole } = useAuth();
  
  if (!user) {
    return <Login />;
  }
  
  // Redirect to appropriate dashboard based on role
  const getDashboardRoute = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'member':
        return '/member';
      case 'reception':
        return '/reception';
      default:
        return '/login';
    }
  };
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
      
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
