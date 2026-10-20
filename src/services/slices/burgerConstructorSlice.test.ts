import burgerConstructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  initialState,
} from './burgerConstructorSlice';

import type { TBurgerConstructorState } from './burgerConstructorSlice';
import type { TIngredient } from '@utils-types';

// Моковые данные
const mockBun: TIngredient = {
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
};

const mockIngredient: TIngredient = {
  ...mockBun,
  _id: '2',
  name: 'Начинка',
  type: 'main',
};

describe('burgerConstructorSlice', () => {
  it('должен вернуть начальное состояние при вызове с неизвестным экшеном', () => {
    const result = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });

    // Сравниваем с импортированным initialState, чтобы тест не разошёлся со слайсом
    expect(result).toEqual(initialState);
  });

  it('должен добавить булку при вызове addIngredient с типом bun', () => {
    const action = addIngredient(mockBun);
    const result = burgerConstructorReducer(undefined, action);

    expect(result.bun).toBeDefined();
    expect(result.bun?.name).toBe('Булка');
    expect(result.bun?.id).toBeDefined();
    expect(result.ingredients).toHaveLength(0);
  });

  it('должен добавить начинку при вызове addIngredient с типом main', () => {
    const action = addIngredient(mockIngredient);
    const result = burgerConstructorReducer(undefined, action);

    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0].name).toBe('Начинка');
    expect(result.ingredients[0].id).toBeDefined();
    expect(result.bun).toBeNull();
  });

  it('должен удалить ингредиент по id при вызове removeIngredient', () => {
    const stateWithIngredient: TBurgerConstructorState = {
      bun: null,
      ingredients: [{ ...mockIngredient, id: 'test-id-123' }],
    };

    const action = removeIngredient('test-id-123');
    const result = burgerConstructorReducer(stateWithIngredient, action);

    expect(result.ingredients).toHaveLength(0);
  });

  it('должен переместить ингредиент при вызове moveIngredient', () => {
    const ingredient1 = { ...mockIngredient, id: 'id-1', name: 'Первый' };
    const ingredient2 = { ...mockIngredient, id: 'id-2', name: 'Второй' };
    const ingredient3 = { ...mockIngredient, id: 'id-3', name: 'Третий' };

    const stateWithIngredients: TBurgerConstructorState = {
      bun: null,
      ingredients: [ingredient1, ingredient2, ingredient3],
    };

    // Меняем местами первый (0) и третий (2) элементы
    const action = moveIngredient({ from: 0, to: 2 });
    const result = burgerConstructorReducer(stateWithIngredients, action);

    // Проверяем порядок одним сравнением — короче и понятнее при падении
    expect(result.ingredients.map((i) => i.name)).toEqual([
      'Второй',
      'Третий',
      'Первый',
    ]);
  });

  it('должен очистить конструктор при вызове clearConstructor', () => {
    const stateWithData: TBurgerConstructorState = {
      bun: { ...mockBun, id: 'bun-id' },
      ingredients: [{ ...mockIngredient, id: 'main-id' }],
    };

    const result = burgerConstructorReducer(stateWithData, clearConstructor());

    expect(result.bun).toBeNull();
    expect(result.ingredients).toHaveLength(0);
  });
});
