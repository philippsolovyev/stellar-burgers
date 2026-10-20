import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Устанавливаем фейковые токены авторизации
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'fake-access-token');
      document.cookie = 'refreshToken=fake-refresh-token; path=/';
    });

    // Перехватываем запросы к бэкенду и подменяем их данными из HAR
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
      notFound: 'fallback',
    });
    await page.routeFromHAR('tests/hars/user.har', {
      url: '**/api/auth/user',
      update: false,
      notFound: 'fallback',
    });
    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/orders',
      update: false,
      notFound: 'fallback',
    });

    await page.goto('/');
  });

  // --- ТЕСТ 1: Добавление ингредиента ---
  test('должен добавлять ингредиент в конструктор', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';

    // Ждем загрузки списка ингредиентов
    await expect(page.getByRole('heading', { name: 'Булки' })).toBeVisible({ timeout: 15000 });

    // Проверяем, что конструктор пуст
    await expect(page.getByText('Выберите булки').first()).toBeVisible();

    // Кликаем на кнопку "Добавить" у булки
    const bunCard = page.locator('li').filter({ hasText: bunName }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click({ force: true });

    // Проверяем, что булка добавилась (плейсхолдер пропал)
    await expect(page.getByText('Выберите булки').first()).not.toBeVisible();
  });

  // --- ТЕСТ 2: Работа модального окна ---
  test('должен открывать и закрывать модальное окно ингредиента', async ({ page }) => {
    const ingredientName = 'Краторная булка N-200i';

    await expect(page.getByRole('heading', { name: 'Булки' })).toBeVisible();
    
    // Открываем модалку
    await page.getByText(ingredientName).first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    await expect(page.getByRole('heading', { name: ingredientName, level: 3 })).toBeVisible();

    // Закрываем по крестику
    await page.getByRole('button', { name: 'Закрыть' }).click();
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();

    // Открываем снова и закрываем по клику на оверлей
    await page.getByText(ingredientName).first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    
    await page.mouse.click(10, 10); 
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  // --- ТЕСТ 3: Создание заказа ---
  test('должен оформлять заказ и очищать конструктор', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const mainName = 'Биокотлета из марсианской Магнолии';
    const mockOrderNumber = '557'; // Номер из мок-ответа order.har

    await expect(page.getByRole('heading', { name: 'Булки' })).toBeVisible();

    // Собираем бургер
    const bunCard = page.locator('li').filter({ hasText: bunName }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click({ force: true });

    const mainCard = page.locator('li').filter({ hasText: mainName }).first();
    await mainCard.getByRole('button', { name: 'Добавить' }).click({ force: true });

    // Оформляем заказ
    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    // Проверяем, что появился верный номер заказа
    await expect(page.getByText(mockOrderNumber)).toBeVisible({ timeout: 10000 });

    // Закрываем модалку
    await page.getByRole('button', { name: 'Закрыть' }).click();

    // Проверяем, что конструктор очистился
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку').first()).toBeVisible();
  });
});