<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, ChevronDown, ChevronRight, LogOut, Moon, Settings2, Sun, UserRound } from 'lucide-vue-next'
import { useNotificationsStore } from '@/common/shared/state/notifications'
import { useTheme } from '@/common/shared/utils/theme'
import { formatDateTime } from '@/common/shared/utils/format'
import Popover from '@/common/shared/UI/Popover.vue'
import DropdownMenu from '@/common/shared/UI/DropdownMenu.vue'
import DropdownMenuTrigger from '@/common/shared/UI/DropdownMenuTrigger.vue'
import DropdownMenuContent from '@/common/shared/UI/DropdownMenuContent.vue'
import DropdownMenuItem from '@/common/shared/UI/DropdownMenuItem.vue'
import DropdownMenuSeparator from '@/common/shared/UI/DropdownMenuSeparator.vue'
import Badge from '@/common/shared/UI/Badge.vue'
import { cn } from '@/common/shared/utils/cn'

const route = useRoute()
const notificationsStore = useNotificationsStore()
const { theme, toggle: toggleTheme } = useTheme()

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/overview': { title: 'Обзор', subtitle: 'Состояние рабочего пространства и быстрые действия' },
  '/collections': { title: 'Подборки', subtitle: 'Создавайте страницы с товарами и управляйте их публикацией' },
  '/employees': { title: 'Сотрудники', subtitle: 'Управляйте доступом команды к сервису' },
  '/roles': { title: 'Роли и права', subtitle: 'Настройте права доступа для разных задач команды' },
  '/settings': { title: 'Настройки', subtitle: 'Параметры рабочего пространства' },
  '/profile': { title: 'Профиль', subtitle: 'Личные данные и безопасность аккаунта' }
}

const currentPage = computed(() => {
  const key = Object.keys(pageTitles).find((path) => route.path.startsWith(path))
  return key ? pageTitles[key] : { title: 'Подборка', subtitle: '' }
})

const typeBadge: Record<string, 'success' | 'default' | 'warning'> = {
  success: 'success',
  info: 'default',
  warning: 'warning'
}
</script>

<template>
  <header class="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-card px-6 py-3">
    <div class="min-w-0">
      <nav class="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Хлебные крошки">
        <NuxtLink to="/overview" class="transition-colors hover:text-foreground">Маркетинг</NuxtLink>
        <ChevronRight class="size-3.5" aria-hidden="true" />
        <strong class="font-medium text-foreground">{{ currentPage.title }}</strong>
      </nav>
      <p v-if="currentPage.subtitle" class="mt-0.5 truncate text-sm text-muted-foreground">{{ currentPage.subtitle }}</p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <!-- Переключатель темы -->
      <button
        class="flex size-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
        @click="toggleTheme"
      >
        <Sun v-if="theme === 'dark'" class="size-5" aria-hidden="true" />
        <Moon v-else class="size-5" aria-hidden="true" />
      </button>

      <!-- Уведомления -->
      <Popover class="w-96">
        <template #trigger>
          <button
            class="relative flex size-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Уведомления"
          >
            <Bell class="size-5" aria-hidden="true" />
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white"
            >
              {{ notificationsStore.unreadCount }}
            </span>
          </button>
        </template>
        <div>
          <div class="flex items-center justify-between border-b border-border px-4 py-3">
            <p class="text-sm font-semibold">Уведомления</p>
            <button
              class="cursor-pointer text-xs font-medium text-primary transition-colors hover:underline disabled:opacity-50"
              :disabled="notificationsStore.unreadCount === 0"
              @click="notificationsStore.markAllRead()"
            >
              Прочитать всё
            </button>
          </div>
          <ul class="max-h-96 overflow-y-auto">
            <li
              v-for="notification in notificationsStore.notifications"
              :key="notification.id"
              :class="cn('flex flex-col gap-1 border-b border-border px-4 py-3 last:border-0', !notification.read && 'bg-accent/50')"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium">{{ notification.title }}</p>
                <Badge :variant="typeBadge[notification.type]" dot class="shrink-0">
                  {{ notification.read ? 'Прочитано' : 'Новое' }}
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground">{{ notification.description }}</p>
              <p class="text-xs text-muted-foreground">{{ formatDateTime(notification.time) }}</p>
            </li>
          </ul>
        </div>
      </Popover>

      <!-- Профиль -->
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Открыть меню профиля">
          <button class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted">
            <span class="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">АК</span>
            <span class="hidden sm:block">
              <span class="block text-sm font-medium">Анна Ковалёва</span>
              <span class="block text-xs text-muted-foreground">Администратор</span>
            </span>
            <ChevronDown class="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div class="px-2.5 py-2">
            <p class="text-sm font-medium">Анна Ковалёва</p>
            <p class="text-xs text-muted-foreground">anna@playmarket.io</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="$router.push('/profile')">
            <UserRound aria-hidden="true" />
            Настройки профиля
          </DropdownMenuItem>
          <DropdownMenuItem @select="$router.push('/profile')">
            <Settings2 aria-hidden="true" />
            Настройка 2FA
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive @select="$router.push('/sign-in')">
            <LogOut aria-hidden="true" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
