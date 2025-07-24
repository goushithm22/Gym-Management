import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout.jsx';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  UserCheck,
  Clock
} from 'lucide-react';
import ReceptionOverview from '@/components/Reception/ReceptionOverview.jsx';
import MemberSearch from '@/components/Reception/MemberSearch.jsx';

const ReceptionDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/reception', active: true },
    { icon: Search, label: 'Member Search', href: '/reception/search', active: false },
    { icon: Users, label: 'Member Directory', href: '/reception/members', active: false },
    { icon: UserCheck, label: 'Check-ins', href: '/reception/checkins', active: false },
    { icon: Clock, label: 'Visit Logs', href: '/reception/logs', active: false },
  ];

  return (
    <MainLayout sidebarItems={sidebarItems} title="Reception Dashboard">
      <Routes>
        <Route path="/" element={<ReceptionOverview />} />
        <Route path="/search" element={<MemberSearch />} />
        <Route path="/members" element={<div>Member Directory</div>} />
        <Route path="/checkins" element={<div>Member Check-ins</div>} />
        <Route path="/logs" element={<div>Visit Logs</div>} />
      </Routes>
    </MainLayout>
  );
};

export default ReceptionDashboard;