import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import BackButton from '@/components/common/BackButton';
import { Wrapper, BackBtnWrap, Card, CardBody } from './ProfileStyles';
import { ProfileHeader } from './ProfileHeader';
import { ProfileBasicInfo } from './ProfileBasicInfo';
import { ProfileRoleSections } from './ProfileRoleSections';

const PROFILE_CONFIGS: Record<string, { badge: string; showCode: boolean; bioPlaceholder: string }> = {
  student: { badge: "INNOVADOR", showCode: true, bioPlaceholder: "Escribe brevemente sobre tu experiencia o intereses de innovación (máx. 200 caracteres)." },
  company: { badge: "EMPRESA SOCIA", showCode: false, bioPlaceholder: "Descripción de la institución o área..." },
  judge: { badge: "EXPERTO EVALUADOR", showCode: false, bioPlaceholder: "Resumen de tu expertise técnico..." },
  admin: { badge: "SOPORTE TÉCNICO", showCode: false, bioPlaceholder: "Notas de administración..." }
};

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile: profile, refetchProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    bio: profile?.bio || '',
    nickname: profile?.nickname || '',
    phone: profile?.phone || '',
    studentCode: profile?.studentCode || '',
    institution: (profile as any)?.institution || '',
    specialty: profile?.specialty || '',
    ageRange: (profile as any)?.ageRange || '',
  });

  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const [saving, setSaving] = useState(false);
  const [showPassChange, setShowPassChange] = useState(false);
  const [passData, setPassData] = useState({ old: '', newPass: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!profile || !user) return null;

  const roleConfig = PROFILE_CONFIGS[profile.role || 'student'];
  const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userService.updateProfile(profileData as any);
      await refetchProfile();
      toast.success('Perfil actualizado correctamente');
    } catch (e) {
      toast.error('Hubo un error guardando tu perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      await authService.linkGoogleAccount();
      toast.success('Cuenta de Google vinculada correctamente');
      window.location.reload();
    } catch (e: any) {
      if (e.code === 'auth/credential-already-in-use') {
        toast.error('Esta cuenta de Google ya está vinculada a otro usuario.');
      } else {
        toast.error('Error al vincular con Google.');
      }
    }
  };

  const handleChangePass = async () => {
    if (!passData.old || !passData.newPass || !passData.confirm) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (passData.newPass !== passData.confirm) {
      toast.error('Las nuevas contraseñas no coinciden');
      return;
    }
    setPassLoading(true);
    try {
      await authService.changePassword(passData.old, passData.newPass);
      toast.success('Contraseña actualizada correctamente');
      setShowPassChange(false);
      setPassData({ old: '', newPass: '', confirm: '' });
    } catch (e: any) {
      if (e.code === 'auth/wrong-password') {
        toast.error('La contraseña actual es incorrecta');
      } else {
        toast.error('Error al actualizar la contraseña');
      }
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <Wrapper>
      <BackBtnWrap>
        <BackButton onClick={() => navigate(-1)} />
      </BackBtnWrap>

      <Card>
        <ProfileHeader profile={profile} badge={roleConfig?.badge || 'Usuario'} />

        <CardBody>
          <ProfileBasicInfo
            profileData={profileData as any}
            setProfileData={setProfileData}
            saving={saving}
            onSave={handleSaveProfile}
            countWords={countWords}
            profile={profile}
          />

          <ProfileRoleSections
            profile={profile}
            isGoogleLinked={isGoogleLinked}
            onLinkGoogle={handleLinkGoogle}
            showPassChange={showPassChange}
            setShowPassChange={setShowPassChange}
            passData={passData}
            setPassData={setPassData}
            passLoading={passLoading}
            onChangePass={handleChangePass}
            showOld={showOld}
            setShowOld={setShowOld}
            showNew={showNew}
            setShowNew={setShowNew}
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
          />
        </CardBody>
      </Card>
    </Wrapper>
  );
};

export default ProfileView;
