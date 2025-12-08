## BFB — Next.js App Router

Проєкт на базі Next.js 15 (App Router) та React 19 із Tailwind CSS v4.

### Стек

- **Next.js**: 15.4.6 (App Router)
- **React**: 19.1.0
- **Tailwind CSS**: ^4 з плагіном `@tailwindcss/postcss`
- **TypeScript**: ^5

### Вимоги

- Node.js 18.18+ або 20+ (рекомендовано LTS)
- npm / yarn / pnpm / bun (на вибір)

### Скрипти

```bash
npm run dev     # запуск dev-сервера (Turbopack)
npm run build   # продакшн-білд
npm run start   # старт продакшн-сервера
npm run lint    # перевірка ESLint
```

Dev-сервер буде доступний на `http://localhost:3000`.

### Структура проєкту

```
src/
  app/
    about/
      page.tsx
    contacts/
      page.tsx
    shop/
      [slug]/
        page.tsx
      page.tsx
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
public/
  *.svg
```

### Роутинг

- `/` → `src/app/page.tsx`
- `/about` → `src/app/about/page.tsx`
- `/contacts` → `src/app/contacts/page.tsx`
- `/shop` → `src/app/shop/page.tsx`
- `/shop/[slug]` → динамічний маршрут `src/app/shop/[slug]/page.tsx`

### Стилі та шрифти

- Глобальні стилі: `src/app/globals.css`
- Tailwind CSS v4 підключено через `postcss.config.mjs` з плагіном `@tailwindcss/postcss`
- Шрифти: `next/font` (Geist, Geist Mono) ініціалізуються в `src/app/layout.tsx`

### Якість коду

- ESLint: конфіг `eslint.config.mjs` розширює `next/core-web-vitals` та `next/typescript`
- Запуск: `npm run lint`

### Змінні середовища

- Використовуйте файли `.env.local`, `.env.development`, `.env.production` для конфігурацій
- Не комітьте `.env*` до репозиторію
- Додавати нові змінні слід у `.env`-файли, а не хардкодити в коді

### Деплой

- Production-білд: `npm run build`
- Запуск: `npm run start` (після білду)
- Рекомендована платформа — Vercel. Документація з деплою: https://nextjs.org/docs/app/building-your-application/deploying

### Розробка

- Головне компонування — `src/app/layout.tsx`
- Сторінки та маршрути — в `src/app/*` (App Router)
- Статичні ресурси — у `public/`

### Корисні посилання

- Документація Next.js: https://nextjs.org/docs
- Документація Tailwind CSS v4: https://tailwindcss.com/docs

### Автоконвертація px → vw

Налаштовано PostCSS для автоматичної конвертації пікселів у `vw`.

- **Плагіни**: `postcss-px-to-viewport-8-plugin`, `postcss-functions`
- **Десктоп-база**: `1920` (значення в px автоматично стають `vw`)
- **Мобільна база автоматично** всередині `@media (max-width: 1024px)` — `1024` (через media-aware конвертацію)
- **Ручні функції** (додатково): `vw(x)` — база `1920`, `mvw(x)` — база `1024`
- **Виключення**: додайте селектор `.no-vw` на обгортку, щоб не конвертувати дочірні правила

Приклад:

```css
/* Desktop: px → vw автоматично */
.card {
  padding: 24px; /* → ~1.25vw при базі 1920 */
  gap: 16px; /* → ~0.8333vw */
}

/* Mobile: всередині цього медіа px автоматично рахуються від 1024 */
@media (max-width: 768px) {
  .card {
    padding: 24px; /* → ~2.3438vw при базі 1024 */
  }
}

/* Вимкнути конвертацію для блоку */
.no-vw .pixel-perfect {
  border-width: 1px; /* залишиться 1px */
}
```

Змінити базову ширину можна в `postcss.config.mjs`:

- для десктопа — `viewportWidth`
- для ручних функцій — `vw()` (1920) та `mvw()` (1024)
