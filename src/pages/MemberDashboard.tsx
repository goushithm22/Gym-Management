
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { 
  LayoutDashboard, 
  CreditCard, 
  Bell, 
  User,
  Target,
  Calendar
} from 'lucide-react';
import MemberOverview from '@/components/Member/MemberOverview';

const MemberDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/member', active: true },
    { icon: User, label: 'My Profile', href: '/member/profile', active: false },
    { icon: CreditCard, label: 'Billing', href: '/member/billing', active: false },
    { icon: Bell, label: 'Notifications', href: '/member/notifications', active: false },
    { icon: Target, label: 'My Goals', href: '/member/goals', active: false },
    { icon: Calendar, label: 'Schedule', href: '/member/schedule', active: false },
  ];

  return (
    <MainLayout sidebarItems={sidebarItems} title="Member Dashboard">
      <Routes>
        <Route path="/" element={<MemberOverview />} />
        <Route path="/profile" element={<div>Member Profile</div>} />
        <Route path="/billing" element={<div>My Bills & Payments</div>} />
        <Route path="/notifications" element={<div>My Notifications</div>} />
        <Route path="/goals" element={<div>Fitness Goals</div>} />
        <Route path="/schedule" element={<div>Class Schedule</div>} />
      </Routes>
    </MainLayout>
  );
};

export default MemberDashboard;
