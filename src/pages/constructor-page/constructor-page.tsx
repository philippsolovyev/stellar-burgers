import { selectIngredientsLoading } from '@slices/ingredientsSlice';
import { ConstructorPageUI } from '@ui-pages';

import { useSelector } from '@services/store';

export const ConstructorPage = (): React.JSX.Element => {
  const isIngredientsLoading = useSelector(selectIngredientsLoading);

  return <ConstructorPageUI isIngredientsLoading={isIngredientsLoading} />;
};
