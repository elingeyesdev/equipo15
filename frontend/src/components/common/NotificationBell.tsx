import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/services/notification.service';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/context/AuthContext';

import { NotificationListSkeleton } from '@/components/SkeletonLoaders';


const Container = styled.div`
  position: relative;
  display: inline-block;
  z-index: 9999;
`;

const bellRing = keyframes`
  0%, 100% { transform-origin: top; }
  15% { transform: rotateZ(10deg); }
  30% { transform: rotateZ(-10deg); }
  45% { transform: rotateZ(5deg); }
  60% { transform: rotateZ(-5deg); }
  75% { transform: rotateZ(2deg); }
`;

const BellButton = styled.button<{ $hasUnread: boolean }>`
  width: 44px;
  height: 44px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FE410A;
  border-radius: 50%;
  cursor: pointer;
  transition-duration: .3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.13);
  border: none;

  svg {
    width: 20px;
    height: 20px;
    path {
      fill: white;
    }
  }

  &:hover {
    background-color: #e53a09;
    svg {
      animation: ${bellRing} 0.9s both;
    }
  }

  &:active {
    transform: scale(0.8);
  }

  ${({ $hasUnread }) =>
    $hasUnread &&
    css`
      svg {
        animation: ${bellRing} 2s ease-in-out infinite;
      }
    `}
`;

const Badge = styled.span`
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: #fff;
  color: #FE410A;
  border: 2px solid #FE410A;
  font-size: 10px;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dropdown = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 100%;
  right: -10px;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 36px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  border: 1px solid rgba(72,80,84,0.15);
  overflow-y: auto;
  z-index: 9999;
  display: ${({ $open }) => ($open ? 'block' : 'none')};
  margin-top: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  @media (max-width: 480px) {
    position: absolute;
    top: 100%;
    right: -10px;
    left: auto;
    width: 290px;
    max-height: 380px;
    margin-top: 8px;
  }
`;

const Header = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 800;
  font-size: 14px;
  color: #0f172a;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationItem = styled.div<{ $unread: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  background: ${({ $unread }) => ($unread ? '#f8fafc' : 'white')};
  transition: background 0.2s;
  position: relative;

  &:hover {
    background: #f1f5f9;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationDeleteTooltip = styled.span`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: rgba(26, 31, 34, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    right: 12px;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent rgba(26, 31, 34, 0.95) transparent;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  flex-shrink: 0;
  box-sizing: border-box;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &:hover {
    background: #ef444410;
    border-color: #ef4444;
    color: #ef4444;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(1px);
  }

  &:hover .custom-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const NotificationTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
  padding-right: 28px;
`;

const NotificationBody = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 10px;
  color: #94a3b8;
  margin-top: 6px;
`;

const EmptyState = styled.div`
  padding: 30px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
`;

export const NotificationBell: React.FC = () => {
  const socket = useSocket();
  const { refetchProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyInbox();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif: any) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [
        {
          id: notif.id || String(Math.random()),
          title: notif.title,
          body: notif.body,
          type: notif.type,
          createdAt: notif.createdAt || new Date().toISOString(),
          readAt: null,
        } as any,
        ...prev,
      ]);

      if (notif.type === 'ROLE_UPDATE' || notif.type === 'ROLE_UPDATED') {
        void refetchProfile().then(() => {
          // Navigate to the correct dashboard after role update
          // We do a small delay to let the profile state settle
          setTimeout(() => {
            navigate('/dashboard');
          }, 300);
        });
      }
    };

    socket.on('notification:received', handleNewNotification);

    return () => {
      socket.off('notification:received', handleNewNotification);
    };
  }, [socket, refetchProfile, navigate]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.readAt) {
      try {
        await notificationService.markAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n))
        );
      } catch (error) {
        console.error('Error marking as read', error);
      }
    }

    setOpen(false);

    if (notif.referenceType === 'IDEA' && notif.referenceId) {
      navigate(`/dashboard?ideaId=${notif.referenceId}`);
    } else if (notif.referenceType === 'CHALLENGE' && notif.referenceId) {
      navigate(`/dashboard?challengeId=${notif.referenceId}`);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    try {
      await notificationService.delete(notif.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      if (!notif.readAt) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification', error);
    }
  };

  return (
    <Container ref={dropdownRef}>
      <BellButton $hasUnread={unreadCount > 0} onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 448 512" className="bell"><path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z" /></svg>
        {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
      </BellButton>

      <Dropdown $open={open}>
        <Header>Notificaciones</Header>
        {loading ? (
          <NotificationListSkeleton count={3} />
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <EmptyState>No tienes notificaciones.</EmptyState>
        ) : (
          <NotificationList>
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                $unread={!notif.readAt}
                onClick={() => handleNotificationClick(notif)}
              >
                <DeleteButton 
                  onClick={(e) => handleDeleteNotification(e, notif)}
                >
                  <NotificationDeleteTooltip className="custom-tooltip">Eliminar notificación</NotificationDeleteTooltip>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </DeleteButton>
                <NotificationTitle style={{ paddingRight: '20px' }}>{notif.title}</NotificationTitle>
                <NotificationBody>{notif.body}</NotificationBody>
                <NotificationTime>
                  {new Date(notif.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </NotificationTime>
              </NotificationItem>
            ))}
          </NotificationList>
        )}
      </Dropdown>
    </Container>
  );
};
