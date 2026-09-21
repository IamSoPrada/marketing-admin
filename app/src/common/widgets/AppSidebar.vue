<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Building2, Check, ChevronDown, CircleHelp, LayoutDashboard, LayoutGrid, Plus, Settings2, Shield, Sparkles, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/common/shared/state/workspace'
import { useCollectionsStore } from '@/modules/Collections/shared/state/collections'
import Popover from '@/common/shared/UI/Popover.vue'
import Modal from '@/common/shared/UI/Modal.vue'
import Button from '@/common/shared/UI/Button.vue'
import Input from '@/common/shared/UI/Input.vue'
import Textarea from '@/common/shared/UI/Textarea.vue'
import Label from '@/common/shared/UI/Label.vue'
import Select from '@/common/shared/UI/Select.vue'
import { cn } from '@/common/shared/utils/cn'

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const collectionsStore = useCollectionsStore()

const navItems = computed(() => [
  { to: '/overview', label: 'Обзор', icon: LayoutDashboard, group: 'Рабочая область' },
  { to: '/collections', label: 'Подборки', icon: LayoutGrid, count: collectionsStore.active.length, group: 'Рабочая область' },
  { to: '/employees', label: 'Сотрудники', icon: Users, group: 'Настройки' },
  { to: '/roles', label: 'Роли', icon: Shield, group: 'Настройки' },
  { to: '/settings', label: 'Настройки', icon: Settings2, group: 'Настройки' }
])

const groups = computed(() => [...new Set(navItems.value.map((i) => i.group))])

const isActive = (to: string) => route.path.startsWith(to)

// --- Создание рабочего пространства ---
const createOpen = ref(false)
const form = ref({ name: '', description: '', color: '#635bff', access: 'private' })
const saving = ref(false)

async function createWorkspace() {
  if (!form.value.name.trim()) return
  saving.value = true
  await workspaceStore.create({
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    color: form.value.color,
    access: form.value.access as 'private' | 'team'
  })
  saving.value = false
  createOpen.value = false
  form.value = { name: '', description: '', color: '#635bff', access: 'private' }
  toast.success('Рабочее пространство создано', { description: 'Теперь можно пригласить команду и настроить роли.' })
}

// --- Помощь ---
const helpOpen = ref(false)
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col border-r border-border bg-card max-lg:w-16">
    <!-- Бренд -->
    <NuxtLink to="/overview" class="flex h-16 items-center gap-2.5 border-b border-border px-5 max-lg:justify-center max-lg:px-0">
      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles class="size-4" aria-hidden="true" />
      </span>
      <span class="font-semibold tracking-tight max-lg:hidden">playmarket</span>
      <span class="rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary max-lg:hidden">admin</span>
    </NuxtLink>

    <!-- Переключатель рабочего пространства -->
    <div class="border-b border-border p-3 max-lg:px-2">
      <Popover align="start" class="w-64">
        <template #trigger>
          <button
            class="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted max-lg:justify-center"
            aria-label="Переключить рабочее пространство"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              :style="{ backgroundColor: workspaceStore.current?.color }"
            >
              {{ workspaceStore.current?.name.slice(0, 2).toUpperCase() }}
            </span>
            <span class="min-w-0 flex-1 max-lg:hidden">
              <span class="block truncate text-sm font-medium">{{ workspaceStore.current?.name }}</span>
              <span class="block truncate text-xs text-muted-foreground">{{ workspaceStore.current?.description }}</span>
            </span>
            <ChevronDown class="size-4 text-muted-foreground max-lg:hidden" aria-hidden="true" />
          </button>
        </template>
        <div class="p-1.5">
          <p class="px-2.5 pt-1.5 pb-2 text-xs font-medium text-muted-foreground">Рабочие пространства</p>
          <button
            v-for="workspace in workspaceStore.workspaces"
            :key="workspace.id"
            class="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            @click="workspaceStore.switchTo(workspace.id)"
          >
            <span
              class="flex size-7 items-center justify-center rounded-md text-[10px] font-bold text-white"
              :style="{ backgroundColor: workspace.color }"
            >
              {{ workspace.name.slice(0, 2).toUpperCase() }}
            </span>
            <span class="min-w-0 flex-1 truncate text-left">{{ workspace.name }}</span>
            <Check v-if="workspace.id === workspaceStore.currentId" class="size-4 text-primary" aria-hidden="true" />
          </button>
          <div class="my-1.5 h-px bg-border" />
          <button
            class="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-primary transition-colors hover:bg-accent"
            @click="createOpen = true"
          >
            <Plus class="size-4" aria-hidden="true" />
            Создать пространство
          </button>
        </div>
      </Popover>
    </div>

    <!-- Навигация -->
    <nav class="flex-1 overflow-y-auto p-3 max-lg:px-2" aria-label="Основная навигация">
      <div v-for="group in groups" :key="group" class="mb-4">
        <p class="px-2.5 pt-2 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase max-lg:hidden">
          {{ group }}
        </p>
        <NuxtLink
          v-for="item in navItems.filter((i) => i.group === group)"
          :key="item.to"
          :to="item.to"
          :aria-label="item.label"
          :class="
            cn(
              'mb-0.5 flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-lg:justify-center max-lg:px-0',
              isActive(item.to) && 'bg-accent font-medium text-accent-foreground'
            )
          "
        >
          <component :is="item.icon" class="size-4 shrink-0" aria-hidden="true" />
          <span class="flex-1 max-lg:hidden">{{ item.label }}</span>
          <span
            v-if="item.count !== undefined"
            class="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums max-lg:hidden"
          >
            {{ item.count }}
          </span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Помощь -->
    <div class="border-t border-border p-3 max-lg:px-2">
      <button
        class="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-lg:justify-center max-lg:px-0"
        aria-label="Помощь"
        @click="helpOpen = true"
      >
        <CircleHelp class="size-4 shrink-0" aria-hidden="true" />
        <span class="max-lg:hidden">Помощь</span>
      </button>
    </div>

    <!-- Модалка создания пространства -->
    <Modal
      v-model="createOpen"
      title="Новое рабочее пространство"
      description="Пространство объединяет подборки, команду и настройки проекта."
    >
      <form class="flex flex-col gap-4" @submit.prevent="createWorkspace">
        <div class="flex flex-col gap-1.5">
          <Label for="ws-name" required>Название пространства</Label>
          <Input id="ws-name" v-model="form.name" placeholder="Например, Marketing space" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="ws-desc">Описание</Label>
          <Textarea id="ws-desc" v-model="form.description" :rows="2" placeholder="Для какой команды или проекта это пространство?" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="ws-color">Цвет</Label>
            <input
              id="ws-color"
              v-model="form.color"
              type="color"
              class="h-10 w-full cursor-pointer rounded-md border border-input bg-card p-1"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="ws-access">Доступ</Label>
            <Select
              id="ws-access"
              v-model="form.access"
              :options="[
                { value: 'private', label: 'Только приглашённые' },
                { value: 'team', label: 'Вся команда' }
              ]"
            />
          </div>
        </div>
      </form>
      <template #footer>
        <Button variant="outline" @click="createOpen = false">Отмена</Button>
        <Button :disabled="!form.name.trim() || saving" @click="createWorkspace">
          <Building2 class="size-4" aria-hidden="true" />
          Создать пространство
        </Button>
      </template>
    </Modal>

    <!-- Помощь -->
    <Modal v-model="helpOpen" title="Помощь" description="Частые вопросы и поддержка команды.">
      <div class="flex flex-col gap-3 text-sm">
        <details class="rounded-lg border border-border p-3">
          <summary class="cursor-pointer font-medium">Как опубликовать подборку?</summary>
          <p class="mt-2 text-muted-foreground">
            Откройте подборку, убедитесь, что в составе минимум 8 названий и заполнены SEO-поля, затем нажмите «Опубликовать».
          </p>
        </details>
        <details class="rounded-lg border border-border p-3">
          <summary class="cursor-pointer font-medium">Как добавить сотрудника?</summary>
          <p class="mt-2 text-muted-foreground">
            В разделе «Сотрудники» нажмите «Пригласить сотрудника», укажите рабочую почту и роль.
          </p>
        </details>
        <details class="rounded-lg border border-border p-3">
          <summary class="cursor-pointer font-medium">Чем живая подборка отличается от ручной?</summary>
          <p class="mt-2 text-muted-foreground">
            Живая подборка обновляет состав автоматически по заданным правилам, ручная — только вами.
          </p>
        </details>
        <Button variant="outline" class="mt-1" @click="toast.info('Заявка в поддержку', { description: 'Mock: в боевой версии откроется чат с поддержкой.' })">
          Написать в поддержку
        </Button>
      </div>
    </Modal>
  </aside>
</template>
