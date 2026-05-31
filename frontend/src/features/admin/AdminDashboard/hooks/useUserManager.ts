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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [data, setData] = useState<SearchState>({ users: [], total: 0, page: 1, limit: pageSize });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [modalUser, setModalUser] = useState<ManagedUser | null>(null);
  const [modalNewRole, setModalNewRole] = useState('');
  const [saving, setSaving] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  const fetchUsers = useCallback(async () => {
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

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

  const openRoleModal = (user: ManagedUser) => {
    setModalUser(user);
    setModalNewRole(user.role);
  };

  const closeRoleModal = () => {
    setModalUser(null);
    setModalNewRole('');
  };

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
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    users: data.users,
    total: data.total,
    loading,
    initialLoad,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    modalUser,
    modalNewRole,
    setModalNewRole,
    openRoleModal,
    closeRoleModal,
    confirmRoleChange,
    saving,
  };
};
