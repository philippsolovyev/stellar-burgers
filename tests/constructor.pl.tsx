import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Читаем номер заказа из HAR-файла, чтобы не дублировать константу в тесте
function getOrderNumberFromHar(): string {
  const harPath = path.resolve(process.cwd(), 'tests/hars/order.har');
  const harContent = JSON.parse(fs.readFileSync(harPath, 'utf8'));

  const orderEntry = harContent.log.entries.find(
    (entry: any) =>
      entry.request.url.includes('/api/orders') && entry.request.method === 'POST'
  );

  if (!orderEntry) {
    throw new Error('POST /api/orders not found in order.har');
  }

  const orderData = JSON.parse(orderEntry.response.content.text);
  return orderData.order.number.toString();
}

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Устанавливаем фейковые токены авторизации до загрузки страницы
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'fake-access-token');
      document.cookie = 'refreshToken=fake-refresh-token; path=/';
    });

    // Перехватываем запросы к бэкенду и подменяем их данными из HAR.
    // notFound: "abort" — незамоканный запрос сразу уронит тест, а не пойдёт в реальную сеть
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
      notFound: 'abort',
    });
    await page.routeFromHAR('tests/hars/user.har', {
      url: '**/api/auth/user',
      update: false,
      notFound: 'abort',
    });
    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/orders',
      update: false,
      notFound: 'abort',
    });

    await page.goto('/');
  });

  // --- ТЕСТ 1: Добавление ингредиента ---
  test('должен добавлять ингредиент в конструктор', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const constructor = page.getByTestId('constructor');

    // Ждем загрузки списка ингредиентов
    await expect(page.getByRole('heading', { name: 'Булки' })).toBeVisible({ timeout: 15000 });

    // Проверяем, что конструктор пуст: плейсхолдер булки показывается дважды
    await expect(constructor.getByText('Выберите булки')).toHaveCount(2);

    // Кликаем на кнопку "Добавить" у булки
    const bunCard = page.locator('li').filter({ hasText: bunName });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    // Проверяем, что выбранная булка появилась в обоих слотах конструктора
    await expect(constructor.getByTestId('constructor-bun-1')).toContainText(bunName);
    await expect(constructor.getByTestId('constructor-bun-2')).toContainText(bunName);
    await expect(constructor.getByText('Выберите булки')).toHaveCount(0);
  });

  // --- ТЕСТ 2: Работа модального окна ---
  test('должен открывать и закрывать модальное окно ингредиента', async ({ page }) => {
    const ingredientName = 'Краторная булка N-200i';
    // Все проверки модалки ограничиваем её контейнером
    const modal = page.getByTestId('modal');

    await expect(page.getByRole('heading', { name: 'Булки' })).toBeVisible();

    // Открываем модалку
    await page.getByRole('link', { name: ingredientName }).click();

    // Проверяем, что модалка показывает данные именно кликнутого ингредиента
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByRole('heading', { name: ingredientName, level: 3 })).toBeVisible();

    // Закрываем по крестику
    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal).not.toBeVisible();

    // Открываем снова и закрываем по клику на оверлей
    await page.getByRole('link', { name: ingredientName }).click();
    await expect(modal).toBeVisible();

    await page.getByTestId('modal-overlay').dispatchEvent('click');
    await expect(modal).not.toBeVisible();
  });

  // --- ТЕСТ 3: Создание заказа ---
  test('должен оформлять заказ и очищать конструктор', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const mainName = 'Биокотлета из марсианской Магнолии';
    const constructor = page.getByTestId('constructor');

    // Номер заказа берём из мока order.har
    const mockOrderNumber = getOrderNumberFromHar();

    await expect(page.getByRole('heading', { name: 'Булки' })).toBeVisible();

    // Собираем бургер
    const bunCard = page.locator('li').filter({ hasText: bunName });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const mainCard = page.locator('li').filter({ hasText: mainName });
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    // Оформляем заказ
    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    // Проверяем, что появился верный номер заказа
    const orderNumberElement = page.getByTestId('order-number');
    await expect(orderNumberElement).toHaveText(mockOrderNumber);

    // Закрываем модалку и проверяем, что она исчезла
    await page.getByRole('button', { name: 'Закрыть' }).click();
    await expect(orderNumberElement).not.toBeVisible();

    // Проверяем, что конструктор очистился: оба плейсхолдера булки и один плейсхолдер начинки
    await expect(constructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(constructor.getByText('Выберите начинку')).toHaveCount(1);
  });
});