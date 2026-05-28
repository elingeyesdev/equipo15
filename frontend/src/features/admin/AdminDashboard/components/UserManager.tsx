import React from 'react';
import { useUserManager } from '../hooks/useUserManager';
import type { ManagedUser } from '../hooks/useUserManager';
import * as S from '../styles/UserManagerStyles';

/* ─── Role labels for display ─────────────────────────────────────────────── */
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  COMPANY: 'Empresa',
  JUDGE: 'Juez',
  USER: 'Estudiante',
};

const ROLES = ['ADMIN', 'COMPANY', 'JUDGE', 'USER'] as const;

/* ─── Helper: get user initials ───────────────────────────────────────────── */
const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/* ─── Skeleton rows for loading ───────────────────────────────────────────── */
const SkeletonRows: React.FC = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <S.SkeletonRow key={i}>
        <S.SkeletonCell>
          <S.UserCell>
            <S.SkeletonCircle />
            <S.UserInfo>
              <S.SkeletonBar $width="140px" />
              <S.SkeletonBar $width="180px" style={{ marginTop: 6 }} />
            </S.UserInfo>
          </S.UserCell>
        </S.SkeletonCell>
        <S.SkeletonCell><S.SkeletonBar $width="90px" /></S.SkeletonCell>
        <S.SkeletonCell><S.SkeletonBar $width="70px" /></S.SkeletonCell>
        <S.SkeletonCell><S.SkeletonBar $width="100px" /></S.SkeletonCell>
        <S.SkeletonCell><S.SkeletonBar $width="60px" /></S.SkeletonCell>
      </S.SkeletonRow>
    ))}
  </>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */

const UserManager: React.FC = () => {
  const um = useUserManager();
  const [searchFocused, setSearchFocused] = React.useState(false);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <S.Container>
      {/* Header */}
      <S.Header>
        <S.Title>
          Gestión de Usuarios
          {!um.loading && <S.TotalBadge>{um.total} usuarios</S.TotalBadge>}
        </S.Title>
      </S.Header>

      {/* Search & Filters */}
      <S.ControlsRow>
        <S.SearchWrapper>
          <S.SearchIcon $focused={searchFocused}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </S.SearchIcon>
          <S.SearchInput
            id="user-search-input"
            type="text"
            placeholder="Buscar por nombre o correo electrónico…"
            value={um.searchTerm}
            onChange={e => um.setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </S.SearchWrapper>

        <S.FilterSelect
          id="user-role-filter"
          value={um.roleFilter}
          onChange={e => um.setRoleFilter(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </S.FilterSelect>
      </S.ControlsRow>

      {/* Table */}
      <S.TableCard>
        <S.Table>
          <S.Thead>
            <tr>
              <S.Th>Usuario</S.Th>
              <S.Th>Facultad</S.Th>
              <S.Th>Rol</S.Th>
              <S.Th>Registrado</S.Th>
              <S.Th>Acción</S.Th>
            </tr>
          </S.Thead>
          <S.Tbody>
            {um.loading || um.initialLoad ? (
              <SkeletonRows />
            ) : um.users.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <S.EmptyWrapper>
                    <S.EmptyIcon>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </S.EmptyIcon>
                    <S.EmptyText>
                      {um.searchTerm
                        ? `No se encontraron usuarios para "${um.searchTerm}"`
                        : 'No hay usuarios registrados'}
                    </S.EmptyText>
                  </S.EmptyWrapper>
                </td>
              </tr>
            ) : (
              um.users.map((user: ManagedUser) => (
                <S.Tr key={user.id}>
                  <S.Td>
                    <S.UserCell>
                      <S.Avatar $url={user.avatarUrl || undefined}>
                        {!user.avatarUrl && getInitials(user.displayName)}
                      </S.Avatar>
                      <S.UserInfo>
                        <S.UserName>{user.displayName}</S.UserName>
                        <S.UserEmail>{user.email}</S.UserEmail>
                      </S.UserInfo>
                    </S.UserCell>
                  </S.Td>
                  <S.Td>{user.studentProfile?.faculty?.name || '—'}</S.Td>
                  <S.Td>
                    <S.RoleBadge $role={user.role}>
                      {ROLE_LABELS[user.role] || user.role}
                    </S.RoleBadge>
                  </S.Td>
                  <S.Td>{formatDate(user.createdAt)}</S.Td>
                  <S.Td>
                    <S.RoleButton onClick={() => um.openRoleModal(user)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Cambiar rol
                    </S.RoleButton>
                  </S.Td>
                </S.Tr>
              ))
            )}
          </S.Tbody>
        </S.Table>

        {/* Pagination */}
        {!um.loading && um.users.length > 0 && (
          <S.PaginationRow>
            <S.PageInfo>
              Mostrando {((um.currentPage - 1) * um.pageSize) + 1}–
              {Math.min(um.currentPage * um.pageSize, um.total)} de {um.total}
            </S.PageInfo>
            <S.PageButtons>
              <S.PageBtn
                disabled={um.currentPage <= 1}
                onClick={() => um.setCurrentPage(um.currentPage - 1)}
              >
                ‹
              </S.PageBtn>
              {Array.from({ length: Math.min(um.totalPages, 5) }, (_, i) => {
                // Show pages around current page
                let page: number;
                if (um.totalPages <= 5) {
                  page = i + 1;
                } else if (um.currentPage <= 3) {
                  page = i + 1;
                } else if (um.currentPage >= um.totalPages - 2) {
                  page = um.totalPages - 4 + i;
                } else {
                  page = um.currentPage - 2 + i;
                }
                return (
                  <S.PageBtn
                    key={page}
                    $active={page === um.currentPage}
                    onClick={() => um.setCurrentPage(page)}
                  >
                    {page}
                  </S.PageBtn>
                );
              })}
              <S.PageBtn
                disabled={um.currentPage >= um.totalPages}
                onClick={() => um.setCurrentPage(um.currentPage + 1)}
              >
                ›
              </S.PageBtn>
            </S.PageButtons>
          </S.PaginationRow>
        )}
      </S.TableCard>

      {/* Role Change Modal */}
      {um.modalUser && (
        <S.ModalOverlay onClick={um.closeRoleModal}>
          <S.ModalCard onClick={e => e.stopPropagation()}>
            <S.ModalTitle>Cambiar Rol de Usuario</S.ModalTitle>
            <S.ModalText>
              Selecciona el nuevo rol para este usuario. El cambio se ejecutará de forma transaccional y segura.
            </S.ModalText>

            <S.ModalUserInfo>
              <S.Avatar $url={um.modalUser.avatarUrl || undefined}>
                {!um.modalUser.avatarUrl && getInitials(um.modalUser.displayName)}
              </S.Avatar>
              <S.UserInfo>
                <S.UserName>{um.modalUser.displayName}</S.UserName>
                <S.UserEmail>{um.modalUser.email}</S.UserEmail>
              </S.UserInfo>
            </S.ModalUserInfo>

            <S.ModalRoleSelect
              id="modal-role-select"
              value={um.modalNewRole}
              onChange={e => um.setModalNewRole(e.target.value)}
            >
              {ROLES.map(r => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}{r === um.modalUser!.role ? ' (actual)' : ''}
                </option>
              ))}
            </S.ModalRoleSelect>

            <S.ModalActions>
              <S.ModalCancelBtn onClick={um.closeRoleModal}>
                Cancelar
              </S.ModalCancelBtn>
              <S.ModalConfirmBtn
                disabled={um.saving || um.modalNewRole === um.modalUser.role}
                onClick={um.confirmRoleChange}
              >
                {um.saving ? 'Guardando…' : 'Confirmar Cambio'}
              </S.ModalConfirmBtn>
            </S.ModalActions>
          </S.ModalCard>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default UserManager;
