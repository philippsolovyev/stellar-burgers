import { selectIsAuthChecked, selectUser } from '@slices/userSlice';
import { Preloader } from '@ui';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
};

type TLocationState = {
  from?: Location;
};

export const ProtectedRoute = ({
  onlyUnAuth,
}: ProtectedRouteProps): React.JSX.Element => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  // Пока идёт проверка — показываем прелоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  // Защищённый маршрут, но пользователь не авторизован
  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Маршрут только для неавторизованных, но пользователь авторизован
  if (onlyUnAuth && user) {
    const from = (location.state as TLocationState | null)?.from ?? {
      pathname: '/',
    };
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
