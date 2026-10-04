import { fetchIngredients, selectIngredientsLoading } from '@slices/ingredientsSlice';
import { ConstructorPageUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const ConstructorPage = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isIngredientsLoading = useSelector(selectIngredientsLoading);

  useEffect(() => {
    void dispatch(fetchIngredients());
  }, [dispatch]);

  return <ConstructorPageUI isIngredientsLoading={isIngredientsLoading} />;
};
