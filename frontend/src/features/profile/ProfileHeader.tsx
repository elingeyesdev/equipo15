import React from 'react';
import type { UserProfile } from '@/types/models';
import { resolveDisplayName } from '@/utils/user.utils';
import { getFacultyName } from '@/config/faculties';
import {
  ProfileBanner,
  BannerGrid,
  BannerNoise,
  AvatarWrap,
  AvatarRing,
  Avatar,
  BannerMeta,
  DisplayName,
  Email,
  BannerPills,
  FacultyPill,
  RolePill,
} from './ProfileStyles';

interface ProfileHeaderProps {
  profile: UserProfile;
  badge: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, badge }) => {
  return (
    <ProfileBanner>
      <BannerGrid />
      <BannerNoise />
      <AvatarWrap>
        <AvatarRing>
          <Avatar
            src={profile.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + resolveDisplayName(profile)}
            alt="Avatar"
          />
        </AvatarRing>
      </AvatarWrap>
      <BannerMeta>
        <DisplayName>{resolveDisplayName(profile)}</DisplayName>
        <Email>{profile.email}</Email>
        <BannerPills>
          {(profile.facultyId || profile.studentProfile?.facultyId) && <FacultyPill>{getFacultyName(profile.facultyId || profile.studentProfile?.facultyId || null, profile.facultyName || profile.studentProfile?.faculty?.name || (profile as any).faculty?.name)}</FacultyPill>}
          <RolePill>{badge}</RolePill>
        </BannerPills>
      </BannerMeta>
    </ProfileBanner>
  );
};
