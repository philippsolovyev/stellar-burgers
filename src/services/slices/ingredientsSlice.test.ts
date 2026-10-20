import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';

import type { TIngredientsState } from './ingredientsSlice';
import type { TIngredient } from '@utils-types';

// Моковые данные для ингредиентов
const mockIngredients: TIngredient[] = [
  {
    _id: '1',
    name: 'Булка',
    type: 'bun',
    proteins: 10,
    fat: 10,
    carbohydrates: 10,
    calories: 100,
    price: 100,
    image: 'image.png',
    image_large: 'image_large.png',
    image_mobile: 'image_mobile.png',
  },
];

describe('ingredientsSlice', () => {
  it('должен вернуть начальное состояние при вызове с неизвестным экшеном', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(result).toEqual({
      items: [],
      isLoading: false,
      error: null,
    });
  });

  it('должен выставить isLoading = true и очистить ошибку при fetchIngredients.pending', () => {
    // Начальное состояние с ошибкой, чтобы проверить её очистку
    const stateWithError: TIngredientsState = {
      items: [],
      isLoading: false,
      error: 'Старая ошибка',
    };

    const result = ingredientsReducer(
      stateWithError,
      fetchIngredients.pending('', undefined)
    );

    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('должен записать ингредиенты и выставить isLoading = false при fetchIngredients.fulfilled', () => {
    const stateLoading: TIngredientsState = {
      items: [],
      isLoading: true,
      error: null,
    };

    const result = ingredientsReducer(
      stateLoading,
      fetchIngredients.fulfilled(mockIngredients, '', undefined)
    );

    expect(result.isLoading).toBe(false);
    expect(result.items).toEqual(mockIngredients);
    expect(result.error).toBeNull();
  });

  it('должен записать ошибку и выставить isLoading = false при fetchIngredients.rejected', () => {
    const stateLoading: TIngredientsState = {
      items: [],
      isLoading: true,
      error: null,
    };

    const error = { message: 'Ошибка сети', name: 'Error' };
    const action = fetchIngredients.rejected(error, '', undefined);

    const result = ingredientsReducer(stateLoading, action);

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe('Ошибка сети');
  });
});
