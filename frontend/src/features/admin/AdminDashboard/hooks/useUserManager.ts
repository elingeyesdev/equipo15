import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { adminService } from '../../../../services/admin.service';

export interface ManagedUser {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  faculty?: { id: string; name: string } | null;
  studentProfile?: { faculty?: { id: string; name: string } | null } | null;
  createdAt: string;
  updatedAt: string;
}

interface SearchState {
  users: ManagedUser[];
  total: number;
  page: number;
  limit: number;
}

export const useUserManager = () => {
  // ── Search & filter state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ── Data state ──
  const [data, setData] = useState<SearchState>({ users: [], total: 0, page: 1, limit: pageSize });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // ── Modal state ──
  const [modalUser, setModalUser] = useState<ManagedUser | null>(null);
  const [modalNewRole, setModalNewRole] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Abort controller for cancelling in-flight requests ──
  const abortRef = useRef<AbortController | null>(null);

  // ── Debounce search input (300ms) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Reset page when role filter changes ──
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  // ── Fetch users ──
  const fetchUsers = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const result = await adminService.searchUsers(
        debouncedSearch || undefined,
        roleFilter || undefined,
        currentPage,
        pageSize,
      );
      setData(result as SearchState);
      setInitialLoad(false);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'CanceledError') return;
      const message =
        error instanceof Error
          ? (error as any).response?.data?.message || error.message
          : 'Error al buscar usuarios.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Derived pagination values ──
  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

  // ── Open role change modal ──
  const openRoleModal = (user: ManagedUser) => {
    setModalUser(user);
    setModalNewRole(user.role);
  };

  const closeRoleModal = () => {
    setModalUser(null);
    setModalNewRole('');
  };

  // ── Submit role change ──
  const confirmRoleChange = async () => {
    if (!modalUser || !modalNewRole) return;
    if (modalNewRole === modalUser.role) {
      toast.info('El usuario ya tiene este rol.');
      closeRoleModal();
      return;
    }

    setSaving(true);
    try {
      await adminService.updateUserRole(modalUser.id, modalNewRole);
      toast.success(
        `Rol de "${modalUser.displayName}" actualizado a ${modalNewRole}`,
      );
      closeRoleModal();
      // Refetch to reflect changes
      await fetchUsers();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? (error as any).response?.data?.message || error.message
          : 'Error al cambiar el rol.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    // Search & filter
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    // Data
    users: data.users,
    total: data.total,
    loading,
    initialLoad,
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    // Modal
    modalUser,
    modalNewRole,
    setModalNewRole,
    openRoleModal,
    closeRoleModal,
    confirmRoleChange,
    saving,
  };
};
