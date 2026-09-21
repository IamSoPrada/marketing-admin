<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Clock3, FolderOpen, Globe, Plus, UserPlus, Users } from 'lucide-vue-next'
import { useCollectionsStore } from '@/modules/Collections/shared/state/collections'
import { useEmployeesStore } from '@/modules/Employees/shared/state/employees'
import { COLLECTION_STATUS_LABELS } from '@/modules/Collections/entities/model/types'
import { formatDateTime, initials } from '@/common/shared/utils/format'
import Card from '@/common/shared/UI/Card.vue'
import Button from '@/common/shared/UI/Button.vue'
import Badge from '@/common/shared/UI/Badge.vue'
import type { CollectionStatus } from '@/modules/Collections/entities/model/types'

const collectionsStore = useCollectionsStore()
const employeesStore = useEmployeesStore()

const counts = computed(() => collectionsStore.statusCounts(collectionsStore.active))

const metrics = computed(() => [
  {
    label: 'Всего подборок',
    value: collectionsStore.active.length,
    hint: 'В активной работе',
    icon: FolderOpen,
    tone: 'bg-primary/10 text-primary',
    to: '/collections'
  },
  {
    label: 'Опубликовано',
    value: counts.value.published,
    hint: 'Доступны покупателям',
    icon: Globe,
    tone: 'bg-success/10 text-success',
    to: '/collections'
  },
  {
    label: 'Черновики',
    value: counts.value.draft,
    hint: counts.value.draft > 0 ? 'Требуют внимания' : 'Всё опубликовано',
    icon: Clock3,
    tone: 'bg-warning/15 text-warning-foreground',
    to: '/collections'
  },
  {
    label: 'Сотрудников',
    value: employeesStore.employees.length,
    hint: `${employeesStore.employees.filter((e) => e.status === 'pending').length} ожидают активации`,
    icon: Users,
    tone: 'bg-accent text-accent-foreground',
    to: '/employees'
  }
])

const recentCollections = computed(() => collectionsStore.active.slice(0, 4))
const pendingEmployees = computed(() => employeesStore.employees.filter((e) => e.status === 'pending'))

const statusVariant: Record<CollectionStatus, 'success' | 'muted' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  unpublished: 'muted',
  archived: 'muted'
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Метрики -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink v-for="metric in metrics" :key="metric.label" :to="metric.to">
        <Card class="h-full p-5 transition-shadow hover:shadow-md">
          <div class="flex items-center gap-3.5">
            <span class="flex size-11 items-center justify-center rounded-xl" :class="metric.tone">
              <component :is="metric.icon" class="size-5" aria-hidden="true" />
            </span>
            <div>
              <p class="text-sm text-muted-foreground">{{ metric.label }}</p>
              <p class="text-2xl font-semibold tabular-nums">{{ metric.value }}</p>
            </div>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">{{ metric.hint }}</p>
        </Card>
      </NuxtLink>
    </div>

    <!-- Быстрые действия -->
    <Card class="flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <h2 class="font-semibold">Быстрые действия</h2>
        <p class="mt-0.5 text-sm text-muted-foreground">Самые частые задачи администратора</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button @click="navigateTo('/collections/new')">
          <Plus aria-hidden="true" />
          Новая подборка
        </Button>
        <Button variant="outline" @click="navigateTo('/employees?invite=1')">
          <UserPlus aria-hidden="true" />
          Пригласить сотрудника
        </Button>
      </div>
    </Card>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <!-- Последние подборки -->
      <Card>
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 class="font-semibold">Последние подборки</h2>
          <NuxtLink to="/collections" class="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Все подборки
            <ArrowRight class="size-3.5" aria-hidden="true" />
          </NuxtLink>
        </div>
        <ul class="divide-y divide-border">
          <li v-for="collection in recentCollections" :key="collection.id">
            <NuxtLink
              :to="`/collections/${collection.id}/edit`"
              class="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/60"
            >
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                :style="{ backgroundColor: collection.primaryColor }"
              >
                {{ collection.name.slice(0, 1) }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium">{{ collection.name }}</span>
                <span class="block text-xs text-muted-foreground">/{{ collection.slug }} · обновлена {{ formatDateTime(collection.updatedAt) }}</span>
              </span>
              <Badge :variant="statusVariant[collection.status]" dot>{{ COLLECTION_STATUS_LABELS[collection.status] }}</Badge>
            </NuxtLink>
          </li>
        </ul>
      </Card>

      <!-- Ожидают активации -->
      <Card>
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 class="font-semibold">Команда</h2>
          <NuxtLink to="/employees" class="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Все сотрудники
            <ArrowRight class="size-3.5" aria-hidden="true" />
          </NuxtLink>
        </div>
        <ul v-if="pendingEmployees.length" class="divide-y divide-border">
          <li v-for="employee in pendingEmployees" :key="employee.id" class="flex items-center gap-3.5 px-5 py-3.5">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {{ initials(employee.name) }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium">{{ employee.name }}</span>
              <span class="block text-xs text-muted-foreground">{{ employee.email }}</span>
            </span>
            <Badge variant="warning" dot>Ожидает активации</Badge>
          </li>
        </ul>
        <p v-else class="px-5 py-8 text-center text-sm text-muted-foreground">
          Все приглашения приняты — команда в полном составе.
        </p>
      </Card>
    </div>
  </div>
</template>
