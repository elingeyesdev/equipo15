import React from 'react';
import AdminDashboard from '../../AdminDashboard/AdminDashboard';
import WhitelistManager from '../../../admin/WhitelistManager';

// The app router expects several named admin views. For now we
// render the central AdminDashboard for each route so the
// sidebar and contained panels (including WhitelistManager)
// become available under the existing routes.

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
