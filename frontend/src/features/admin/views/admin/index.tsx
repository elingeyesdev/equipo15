import React from 'react';
import AdminDashboard from '../../AdminDashboard/AdminDashboard';
import WhitelistManager from '../../../admin/WhitelistManager';

export const AdminStatsView: React.FC = () => <AdminDashboard />;
export const AdminClientsView: React.FC = () => <AdminDashboard />;
export const AdminAccessView: React.FC = () => <WhitelistManager />;
export const AdminUsersView: React.FC = () => <AdminDashboard />;

export default {
  AdminStatsView,
  AdminClientsView,
  AdminAccessView,
  AdminUsersView
};
