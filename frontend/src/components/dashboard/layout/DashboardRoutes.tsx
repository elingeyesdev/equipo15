import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { WithRoleGuard } from './WithRoleGuard';
import { useAuth } from '../../../context/AuthContext';

import {
  AdminStatsView, AdminClientsView, AdminAccessView, AdminUsersView, AdminSupportView
} from '../views/admin';
import {
  CompanyStatsView, CompanyChallengesView, CompanyCriteriaView, CompanyPodiumView, CompanyJudgesView
} from '../views/company';
import {
  JudgeInboxView, JudgeEvaluationView, JudgeHistoryView
} from '../views/judge';

const DashboardIndexRedirect = () => {
  const { userProfile } = useAuth();
  if (!userProfile) return null;
  const role = (userProfile.roleInfo?.name || userProfile.role || '').toUpperCase();

  if (role === 'ADMIN') return <Navigate to="/dashboard/admin/stats" replace />;
  if (role === 'COMPANY') return <Navigate to="/dashboard/company/stats" replace />;
  if (role === 'JUDGE') return <Navigate to="/dashboard/judge/inbox" replace />;

  return <Navigate to="/" replace />;
};

export const DashboardRoutes = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="admin/stats" element={<WithRoleGuard allowedRoles={['ADMIN']}><AdminStatsView /></WithRoleGuard>} />
        <Route path="admin/clients" element={<WithRoleGuard allowedRoles={['ADMIN']}><AdminClientsView /></WithRoleGuard>} />
        <Route path="admin/access" element={<WithRoleGuard allowedRoles={['ADMIN']}><AdminAccessView /></WithRoleGuard>} />
        <Route path="admin/users" element={<WithRoleGuard allowedRoles={['ADMIN']}><AdminUsersView /></WithRoleGuard>} />
        <Route path="admin/support" element={<WithRoleGuard allowedRoles={['ADMIN']}><AdminSupportView /></WithRoleGuard>} />

        <Route path="company/stats" element={<WithRoleGuard allowedRoles={['COMPANY']}><CompanyStatsView /></WithRoleGuard>} />
        <Route path="company/challenges" element={<WithRoleGuard allowedRoles={['COMPANY']}><CompanyChallengesView /></WithRoleGuard>} />
        <Route path="company/criteria" element={<WithRoleGuard allowedRoles={['COMPANY']}><CompanyCriteriaView /></WithRoleGuard>} />
        <Route path="company/podium" element={<WithRoleGuard allowedRoles={['COMPANY']}><CompanyPodiumView /></WithRoleGuard>} />
        <Route path="company/judges" element={<WithRoleGuard allowedRoles={['COMPANY']}><CompanyJudgesView /></WithRoleGuard>} />

        <Route path="judge/inbox" element={<WithRoleGuard allowedRoles={['JUDGE']}><JudgeInboxView /></WithRoleGuard>} />
        <Route path="judge/evaluation/:challengeId?" element={<WithRoleGuard allowedRoles={['JUDGE']}><JudgeEvaluationView /></WithRoleGuard>} />
        <Route path="judge/history" element={<WithRoleGuard allowedRoles={['JUDGE']}><JudgeHistoryView /></WithRoleGuard>} />

        <Route path="/" element={<DashboardIndexRedirect />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};
