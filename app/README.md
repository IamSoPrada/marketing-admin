# Playmarket Admin

Админ-панель для управления рабочим пространством: подборки товаров, сотрудники, роли и права, настройки.

**Статус:** frontend-прототип на mock-данных. Реальные API, база данных и серверные сессии не подключены — все данные живут в памяти вкладки и сбрасываются при перезагрузке.

## Стек

- **Nuxt 4** (Vue 3, TypeScript, strict)
- **Tailwind CSS v4** (через `@tailwindcss/vite`, дизайн-токены в `src/assets/css/tailwind.css`)
- **shadcn-vue / reka-ui** — UI-примитивы copy-in в `src/common/shared/UI/`, кастомизируются классами Tailwind
- **Pinia** — состояние и mock-данные (`src/modules/**/shared/state/`)
- **vue-sonner** — тосты
- **lucide-vue-next** — иконки

## Запуск

```bash
npm install
npm run dev        # dev-сервер
npm run build      # статическая сборка (nuxt generate → dist/)
npm run preview    # локальный просмотр сборки
```

## Демо-маршруты

| Маршрут | Экран |
|---|---|
| `/overview` | Обзор (дашборд) |
| `/collections` | Список подборок |
| `/collections/new` | Мастер создания подборки |
| `/collections/:id/edit` | Редактирование подборки |
| `/employees` | Сотрудники |
| `/roles` | Роли и права |
| `/settings` | Настройки пространства |
| `/sign-in` → `/two-factor` | Вход + 2FA |
| `/sign-up` | Принятие приглашения |
| `/forgot-password` | Сброс пароля |

## Документация

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — структура проекта, слои, конвенции
- [docs/MOCKS.md](docs/MOCKS.md) — мок-слой: что имитируется и как заменить на API
- [docs/UX-FLOWS.md](docs/UX-FLOWS.md) — пользовательские сценарии и состояния интерфейса
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — что изменилось относительно первого прототипа
