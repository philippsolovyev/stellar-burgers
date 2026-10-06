import { logoutUser } from '@slices/userSlice';
import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    const performLogout = async (): Promise<void> => {
      try {
        await dispatch(logoutUser()).unwrap();
        void navigate('/login', { replace: true });
      } catch {
        // ошибка уже в store
      }
    };

    void performLogout();
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
