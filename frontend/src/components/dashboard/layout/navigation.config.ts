import {
  Activity,
  Building,
  Mail,
  ShieldCheck,
  Eye,
  BarChart3,
  FileEdit,
  Trophy,
  Users,
  Inbox,
  ClipboardCheck,
  History,
  ListChecks
} from 'lucide-react';
import type { ElementType } from 'react';

export interface NavItem {
  name: string;
  icon: ElementType;
  path: string;
  roles: string[];
  isComingSoon?: boolean;
  badgeCount?: number;
}

export const NAVIGATION_CONFIG: NavItem[] = [
  { name: 'Resumen Global', icon: Activity, path: '/dashboard/admin/stats', roles: ['ADMIN'] },
  { name: 'Gestión Clientes', icon: Building, path: '/dashboard/admin/clients', roles: ['ADMIN'] },
  { name: 'Config. Accesos', icon: Mail, path: '/dashboard/admin/access', roles: ['ADMIN'] },
  { name: 'Control Usuarios', icon: ShieldCheck, path: '/dashboard/admin/users', roles: ['ADMIN'] },
  { name: 'Soporte', icon: Eye, path: '/dashboard/admin/support', roles: ['ADMIN'], isComingSoon: true },
  
  { name: 'Resultados', icon: BarChart3, path: '/dashboard/company/stats', roles: ['COMPANY'] },
  { name: 'Mis Retos', icon: FileEdit, path: '/dashboard/company/challenges', roles: ['COMPANY'] },
  { name: 'Criterios', icon: ListChecks, path: '/dashboard/company/criteria', roles: ['COMPANY'] },
  { name: 'Selección de Ganadores', icon: Trophy, path: '/dashboard/company/podium', roles: ['COMPANY'] },
  { name: 'Gestión de Jueces', icon: Users, path: '/dashboard/company/judges', roles: ['COMPANY'], isComingSoon: true },
  
  { name: 'Retos Asignados', icon: Inbox, path: '/dashboard/judge/inbox', roles: ['JUDGE'] },
  { name: 'Evaluar Ideas', icon: ClipboardCheck, path: '/dashboard/judge/evaluation', roles: ['JUDGE'] },
  { name: 'Mis Evaluaciones', icon: History, path: '/dashboard/judge/history', roles: ['JUDGE'], isComingSoon: true }
];
