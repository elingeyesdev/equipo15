import {
  Activity,
  Building,
  ShieldCheck,
  Eye,
  BarChart3,
  FileEdit,
  Trophy,
  Users,
  Inbox,
  ClipboardCheck,
  History,
  Bookmark
} from 'lucide-react';
import type { ElementType } from 'react';

export interface NavItem {
  name: string;
  shortName?: string;
  icon: ElementType;
  path: string;
  roles: string[];
  isComingSoon?: boolean;
  badgeCount?: number;
}

export const NAVIGATION_CONFIG: NavItem[] = [
  { name: 'Resumen Global', shortName: 'Resumen', icon: Activity, path: '/dashboard/admin/stats', roles: ['ADMIN'] },
  { name: 'Gestión Clientes', shortName: 'Clientes', icon: Building, path: '/dashboard/admin/clients', roles: ['ADMIN'] },
  { name: 'Accesos y registros', shortName: 'Accesos', icon: ShieldCheck, path: '/dashboard/admin/whitelist', roles: ['ADMIN'] },
  { name: 'Control Usuarios', shortName: 'Usuarios', icon: ShieldCheck, path: '/dashboard/admin/users', roles: ['ADMIN'] },

  { name: 'Resultados', shortName: 'Resultados', icon: BarChart3, path: '/dashboard/company/stats', roles: ['COMPANY'] },
  { name: 'Mis Retos', shortName: 'Retos', icon: FileEdit, path: '/dashboard/company/challenges', roles: ['COMPANY'] },
  { name: 'Gestión de Podio', shortName: 'Podio', icon: Trophy, path: '/dashboard/company/podium', roles: ['COMPANY'] },
  { name: 'Gestión de Jueces', shortName: 'Jueces', icon: Users, path: '/dashboard/company/judges', roles: ['COMPANY'] },

  { name: 'Retos Asignados', shortName: 'Asignados', icon: Inbox, path: '/dashboard/judge/inbox', roles: ['JUDGE'] },
  { name: 'Evaluar Ideas', shortName: 'Evaluar', icon: ClipboardCheck, path: '/dashboard/judge/evaluation', roles: ['JUDGE'] },
  { name: 'Mis Evaluaciones', shortName: 'Historial', icon: History, path: '/dashboard/judge/history', roles: ['JUDGE'] },

  { name: 'Ver Retos', shortName: 'Retos', icon: Eye, path: '/dashboard', roles: ['STUDENT', 'USER'] },
  { name: 'Mis Favoritos', shortName: 'Favoritos', icon: Bookmark, path: '/dashboard/favoritos', roles: ['STUDENT', 'USER'] },
  { name: 'Mis Ideas', shortName: 'Ideas', icon: FileEdit, path: '/dashboard/mis-ideas', roles: ['STUDENT', 'USER'] },
];
