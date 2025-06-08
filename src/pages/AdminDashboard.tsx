
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bell, 
  FileText, 
  ShoppingCart,
  Apple,
  UserPlus
} from 'lucide-react';
import AdminOverview from '@/components/Admin/AdminOverview';

const AdminDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', active: true },
    { icon: Users, label: 'Members', href: '/admin/members', active: false },
    { icon: UserPlus, label: 'Add Member', href: '/admin/add-member', active: false },
    { icon: CreditCard, label: 'Billing', href: '/admin/billing', active: false },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications', active: false },
    { icon: FileText, label: 'Reports', href: '/admin/reports', active: false },
    { icon: ShoppingCart, label: 'Supplement Store', href: '/admin/supplements', active: false },
    { icon: Apple, label: 'Diet & Nutrition', href: '/admin/nutrition', active: false },
  ];

  return (
    <MainLayout sidebarItems={sidebarItems} title="Admin Dashboard">
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/members" element={<div>Members Management</div>} />
        <Route path="/add-member" element={<div>Add New Member</div>} />
        <Route path="/billing" element={<div>Billing Management</div>} />
        <Route path="/notifications" element={<div>Notifications Center</div>} />
        <Route path="/reports" element={<div>Reports & Analytics</div>} />
        <Route path="/supplements" element={<div>Supplement Store</div>} />
        <Route path="/nutrition" element={<div>Diet & Nutrition</div>} />
      </Routes>
    </MainLayout>
  );
};

export default AdminDashboard;
