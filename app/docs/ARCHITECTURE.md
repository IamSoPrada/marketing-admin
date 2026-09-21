# Архитектура

## Карта проекта

```
src/
├── app.vue                      # Корень: NuxtLayout + NuxtPage + Toaster
├── assets/css/tailwind.css      # Токены темы (CSS-переменные → Tailwind v4)
├── layouts/
│   ├── default.vue              # Оболочка админки: sidebar + header + main
│   └── auth.vue                 # Центрированный layout для auth-экранов
├── pages/                       # Тонкие обёртки → module pages (FSD pages-слой)
│   ├── index.vue                # Редирект на /overview
│   ├── overview.vue
│   ├── collections/index.vue, new.vue, [id]/edit.vue
│   ├── employees.vue, roles.vue, settings.vue, profile.vue
│   └── sign-in.vue, sign-up.vue, two-factor.vue, forgot-password.vue
├── common/
│   ├── shared/
│   │   ├── UI/                  # shadcn-vue примитивы (copy-in, reka-ui + Tailwind)
│   │   ├── api/mock.ts          # mockDelay, nextId — точка замены на HTTP-клиент
│   │   ├── mocks/catalog.ts     # Каталог товаров (mock-справочник)
│   │   ├── state/               # Кросс-модульные сторы: notifications, workspace
│   │   └── utils/               # cn(), formatDateTime(), initials(), slugify()
│   └── widgets/
│       ├── AppSidebar.vue       # Навигация + переключатель пространства + помощь
│       └── AppHeader.vue        # Breadcrumbs + уведомления + меню профиля
└── modules/                     # FSD-модули
    ├── Auth/pages/              # SignIn, SignUp, TwoFactor, ForgotPassword
    ├── Overview/pages/          # Дашборд
    ├── Collections/
    │   ├── entities/model/types.ts
    │   ├── shared/state/collections.ts   # Pinia-стор + CRUD (mock)
    │   ├── pages/CollectionsPage.vue     # Список, фильтры, действия
    │   └── features/CollectionWizard.vue # Мастер создания/редактирования
    ├── Employees/shared/state/ + pages/
    ├── Profile/pages/           # Личные данные + безопасность (пароль, 2FA)
    ├── Roles/shared/state/ + pages/
    └── Settings/pages/
```

Слои внутри модуля: `pages → features → entities → shared`. Импорты только сверху вниз; кросс-модульное — через `common/shared`.

## Конвенции

- **Алиасы:** `@/` = `src/`, `~/` = корень.
- **UI-примитивы** (`common/shared/UI/`): однословные имена (Button, Input, Modal…), стили через `cva` + `cn()`. Это copy-in код — можно править под проект, обновления shadcn-vue не перетирают.
- **Модальные окна** — на базе reka-ui Dialog: focus-trap, закрытие по Escape и клику по оверлею из коробки.
- **Деструктивные действия** — только через `ConfirmDialog` с именем объекта в тексте.
- **Обратная связь об операциях** — тосты `vue-sonner` (`toast.success/error`), плюс inline-ошибки у полей (`role="alert"`).
- **Типографика/тач-таргеты:** базовый текст 14px, интерактивные элементы ≥ 40px высотой.
- **Форматирование:** таблицы с горизонтальным скроллом на узких экранах, sidebar сворачивается в иконки на `lg`.

## Маршрутизация

Файловая маршрутизация Nuxt (`src/pages/`). Страницы — тонкие обёртки, вся логика в модулях: это держит `pages/` читаемым и позволяет переиспользовать page-компоненты.

`definePageMeta()` — только в файлах `src/pages/`: это compile-time макрос, в компонентах модулей он молча игнорируется (так был сломан auth-layout: meta лежал в `modules/Auth/pages/*`, и `/sign-in` рендерился с сайдбаром). Выбор layout'а, middleware и прочая meta живут в обёртке страницы.

Статическая сборка: `npm run build` = `nuxt generate`, результат в `dist/` (переопределено через `nitro.output.publicDir`). Все маршруты пререндерятся через `crawlLinks`.

## Состояние

Pinia setup-сторы в `src/modules/**/shared/state/` и `src/common/shared/state/` (автоподхват через `pinia.storesDirs`).

Каждый async-метод стора имитирует сетевую задержку (`mockDelay`) и возвращает результат/ошибку — сигнатуры соответствуют будущему API, см. `docs/MOCKS.md`.

## Доступность

- Заметный `:focus-visible` для всех интерактивных элементов (глобальный стиль).
- `aria-label` у иконочных кнопок, `aria-invalid` + `role="alert"` у полей с ошибками, `aria-current` у активного шага степпера и страницы пагинации.
- Статусы дублируются цветом и текстом (Badge с точкой + подпись).
