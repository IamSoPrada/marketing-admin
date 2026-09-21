<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Archive, ArchiveRestore, Copy, Eye, FileText, Globe, MoreHorizontal, Pencil, Plus, Search, Trash2, Undo2
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useCollectionsStore } from '@/modules/Collections/shared/state/collections'
import { useNotificationsStore } from '@/common/shared/state/notifications'
import {
  COLLECTION_STATUS_LABELS, COLLECTION_TYPE_LABELS, MIN_COLLECTION_ITEMS,
  type Collection, type CollectionStatus
} from '@/modules/Collections/entities/model/types'
import { formatDateTime } from '@/common/shared/utils/format'
import Button from '@/common/shared/UI/Button.vue'
import Card from '@/common/shared/UI/Card.vue'
import Badge from '@/common/shared/UI/Badge.vue'
import Tabs from '@/common/shared/UI/Tabs.vue'
import Select from '@/common/shared/UI/Select.vue'
import EmptyState from '@/common/shared/UI/EmptyState.vue'
import Modal from '@/common/shared/UI/Modal.vue'
import ConfirmDialog from '@/common/shared/UI/ConfirmDialog.vue'
import Input from '@/common/shared/UI/Input.vue'
import Label from '@/common/shared/UI/Label.vue'
import Checkbox from '@/common/shared/UI/Checkbox.vue'
import DropdownMenu from '@/common/shared/UI/DropdownMenu.vue'
import DropdownMenuTrigger from '@/common/shared/UI/DropdownMenuTrigger.vue'
import DropdownMenuContent from '@/common/shared/UI/DropdownMenuContent.vue'
import DropdownMenuItem from '@/common/shared/UI/DropdownMenuItem.vue'
import DropdownMenuSeparator from '@/common/shared/UI/DropdownMenuSeparator.vue'

const store = useCollectionsStore()
const notificationsStore = useNotificationsStore()

// --- Фильтры ---
const tab = ref('active')
const query = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')

const tabList = computed(() => [
  { value: 'active', label: 'Активные', count: store.active.length },
  { value: 'archived', label: 'Архив', count: store.archived.length }
])

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'draft', label: 'Черновик' },
  { value: 'published', label: 'Опубликована' },
  { value: 'unpublished', label: 'Снята с публикации' }
]

const typeOptions = [
  { value: 'all', label: 'Все типы' },
  { value: 'manual', label: 'Ручная' },
  { value: 'live', label: 'Живая' }
]

const hasFilters = computed(() => query.value.trim() !== '' || statusFilter.value !== 'all' || typeFilter.value !== 'all')

const filtered = computed(() => {
  const source = tab.value === 'active' ? store.active : store.archived
  const q = query.value.trim().toLowerCase()
  return source.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false
    if (tab.value === 'active' && statusFilter.value !== 'all' && c.status !== statusFilter.value) return false
    if (typeFilter.value !== 'all' && c.type !== typeFilter.value) return false
    return true
  })
})

function resetFilters() {
  query.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
}

// --- Пагинация ---
const PAGE_SIZE = 8
const page = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

function setPage(next: number) {
  page.value = Math.min(Math.max(1, next), pageCount.value)
}

const statusVariant: Record<CollectionStatus, 'success' | 'muted' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  unpublished: 'muted',
  archived: 'muted'
}

// --- Действия ---
const previewItem = ref<Collection | null>(null)
const duplicateItem = ref<Collection | null>(null)
const duplicateName = ref('')
const duplicateOptions = ref({ items: true, design: true, status: false })
const publishItem = ref<Collection | null>(null)
const unpublishItem = ref<Collection | null>(null)
const archiveItem = ref<Collection | null>(null)
const restoreItem = ref<Collection | null>(null)
const deleteItem = ref<Collection | null>(null)
const busy = ref(false)

function openDuplicate(collection: Collection) {
  duplicateItem.value = collection
  duplicateName.value = `${collection.name} — копия`
  duplicateOptions.value = { items: true, design: true, status: false }
}

function publishChecks(c: Collection) {
  return [
    { label: `Состав: ${c.itemIds.length} из ${MIN_COLLECTION_ITEMS} названий`, ok: c.itemIds.length >= MIN_COLLECTION_ITEMS },
    { label: 'Название заполнено', ok: !!c.name.trim() },
    { label: 'Описание заполнено', ok: !!c.description.trim() },
    { label: 'SEO title и description заполнены', ok: !!c.seoTitle.trim() && !!c.seoDescription.trim() }
  ]
}

async function doDuplicate() {
  if (!duplicateItem.value || !duplicateName.value.trim()) return
  busy.value = true
  const copy = await store.duplicate(duplicateItem.value.id, duplicateName.value.trim())
  busy.value = false
  duplicateItem.value = null
  if (copy) toast.success('Копия создана', { description: `«${copy.name}» сохранена как черновик.` })
}

async function doPublish() {
  if (!publishItem.value) return
  busy.value = true
  await store.publish(publishItem.value.id)
  busy.value = false
  notificationsStore.push({ title: 'Подборка опубликована', description: `«${publishItem.value.name}» доступна покупателям`, type: 'success' })
  toast.success('Подборка опубликована', { description: 'Страница доступна покупателям.' })
  publishItem.value = null
}

async function doUnpublish() {
  if (!unpublishItem.value) return
  busy.value = true
  await store.unpublish(unpublishItem.value.id)
  busy.value = false
  toast.success('Подборка снята с публикации', { description: 'Покупатели больше не видят страницу.' })
  unpublishItem.value = null
}

async function doArchive() {
  if (!archiveItem.value) return
  busy.value = true
  await store.archive(archiveItem.value.id)
  busy.value = false
  toast.success('Подборка архивирована', { description: 'Найти её можно на вкладке «Архив».' })
  archiveItem.value = null
}

async function doRestore() {
  if (!restoreItem.value) return
  busy.value = true
  await store.unarchive(restoreItem.value.id)
  busy.value = false
  toast.success('Подборка восстановлена', { description: 'Она снова в списке активных как черновик.' })
  restoreItem.value = null
}

async function doDelete() {
  if (!deleteItem.value) return
  busy.value = true
  await store.remove(deleteItem.value.id)
  busy.value = false
  toast.success('Подборка удалена')
  deleteItem.value = null
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Tabs v-model="tab" :tabs="tabList" />
      <Button @click="navigateTo('/collections/new')">
        <Plus aria-hidden="true" />
        Новая подборка
      </Button>
    </div>

    <Card>
      <!-- Тулбар -->
      <div class="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
        <div class="relative min-w-60 flex-1">
          <Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input v-model="query" class="pl-9" placeholder="Поиск по названию или адресу" aria-label="Поиск по подборкам" @input="setPage(1)" />
        </div>
        <Select v-if="tab === 'active'" v-model="statusFilter" :options="statusOptions" aria-label="Фильтр по статусу" class="w-48" @update:model-value="setPage(1)" />
        <Select v-model="typeFilter" :options="typeOptions" aria-label="Фильтр по типу" class="w-40" @update:model-value="setPage(1)" />
      </div>

      <!-- Таблица -->
      <div v-if="paged.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th class="px-4 py-3 font-medium">Название</th>
              <th class="px-4 py-3 font-medium">Адрес</th>
              <th class="px-4 py-3 font-medium">Тип</th>
              <th class="px-4 py-3 font-medium">Состав</th>
              <th class="px-4 py-3 font-medium">Статус</th>
              <th class="px-4 py-3 font-medium">Обновлено</th>
              <th class="px-4 py-3" aria-label="Действия" />
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="collection in paged" :key="collection.id" class="transition-colors hover:bg-muted/50">
              <td class="px-4 py-3">
                <NuxtLink :to="`/collections/${collection.id}/edit`" class="flex items-center gap-3">
                  <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                    :style="{ backgroundColor: collection.primaryColor }"
                  >
                    {{ collection.name.slice(0, 1) }}
                  </span>
                  <span class="font-medium text-foreground hover:underline">{{ collection.name }}</span>
                </NuxtLink>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-muted-foreground">/{{ collection.slug }}</td>
              <td class="px-4 py-3">
                <Badge :variant="collection.type === 'live' ? 'default' : 'outline'" :dot="collection.type === 'live'">
                  {{ COLLECTION_TYPE_LABELS[collection.type] }}
                </Badge>
              </td>
              <td class="px-4 py-3 tabular-nums">
                {{ collection.itemIds.length }}
                <span class="text-muted-foreground">названий</span>
              </td>
              <td class="px-4 py-3">
                <Badge :variant="statusVariant[collection.status]" dot>{{ COLLECTION_STATUS_LABELS[collection.status] }}</Badge>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{{ formatDateTime(collection.updatedAt) }}</td>
              <td class="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger :aria-label="`Действия для ${collection.name}`">
                    <button class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <MoreHorizontal class="size-4" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <template v-if="tab === 'active'">
                      <DropdownMenuItem @select="previewItem = collection">
                        <Eye aria-hidden="true" />Открыть предпросмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem @select="navigateTo(`/collections/${collection.id}/edit`)">
                        <Pencil aria-hidden="true" />Редактировать подборку
                      </DropdownMenuItem>
                      <DropdownMenuItem @select="openDuplicate(collection)">
                        <Copy aria-hidden="true" />Дублировать подборку
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem v-if="collection.status !== 'published'" @select="publishItem = collection">
                        <Globe aria-hidden="true" />Опубликовать
                      </DropdownMenuItem>
                      <DropdownMenuItem v-else @select="unpublishItem = collection">
                        <Undo2 aria-hidden="true" />Снять с публикации
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive @select="archiveItem = collection">
                        <Archive aria-hidden="true" />Архивировать
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive @select="deleteItem = collection">
                        <Trash2 aria-hidden="true" />Удалить
                      </DropdownMenuItem>
                    </template>
                    <template v-else>
                      <DropdownMenuItem @select="restoreItem = collection">
                        <ArchiveRestore aria-hidden="true" />Восстановить
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive @select="deleteItem = collection">
                        <Trash2 aria-hidden="true" />Удалить навсегда
                      </DropdownMenuItem>
                    </template>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty states -->
      <EmptyState
        v-else-if="hasFilters"
        :icon="Search"
        title="Ничего не найдено"
        description="Попробуйте изменить запрос или сбросить фильтры."
        action-label="Сбросить фильтры"
        @action="resetFilters"
      />
      <EmptyState
        v-else-if="tab === 'archived'"
        :icon="Archive"
        title="Архив пуст"
        description="Архивированные подборки появятся здесь."
      />
      <EmptyState
        v-else
        :icon="FileText"
        title="Пока нет подборок"
        description="Создайте первую подборку, чтобы собрать страницу с товарами для покупателей."
        action-label="Новая подборка"
        @action="navigateTo('/collections/new')"
      />

      <!-- Футер с пагинацией -->
      <div v-if="paged.length" class="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>Показано {{ paged.length }} из {{ filtered.length }} подборок</span>
        <div class="flex items-center gap-1">
          <Button variant="outline" size="sm" :disabled="page <= 1" aria-label="Предыдущая страница" @click="setPage(page - 1)">‹</Button>
          <Button
            v-for="n in pageCount"
            :key="n"
            :variant="n === page ? 'default' : 'outline'"
            size="sm"
            :aria-label="`Страница ${n}`"
            :aria-current="n === page ? 'page' : undefined"
            @click="setPage(n)"
          >
            {{ n }}
          </Button>
          <Button variant="outline" size="sm" :disabled="page >= pageCount" aria-label="Следующая страница" @click="setPage(page + 1)">›</Button>
        </div>
      </div>
    </Card>

    <!-- Предпросмотр -->
    <Modal :open="!!previewItem" :title="previewItem?.name ?? ''" description="Так подборку видят покупатели." size="lg" @update:open="previewItem = null">
      <div v-if="previewItem" class="flex flex-col gap-4">
        <div class="rounded-xl p-5 text-white" :style="{ backgroundColor: previewItem.primaryColor }">
          <h3 class="text-lg font-semibold">{{ previewItem.name }}</h3>
          <p class="mt-1 text-sm text-white/85">{{ previewItem.description || 'Описание не заполнено' }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div
            v-for="itemId in previewItem.itemIds"
            :key="itemId"
            class="rounded-lg border border-border p-3 text-center"
          >
            <div class="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-bold">
              {{ store.catalog.find((i) => i.id === itemId)?.name.slice(0, 1) }}
            </div>
            <p class="truncate text-xs font-medium">{{ store.catalog.find((i) => i.id === itemId)?.name }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <Button variant="outline" @click="previewItem = null">Закрыть</Button>
        <Button @click="navigateTo(`/collections/${previewItem?.id}/edit`)">Редактировать</Button>
      </template>
    </Modal>

    <!-- Дублирование -->
    <Modal :open="!!duplicateItem" title="Дублировать подборку" description="Будет создан новый черновик. Исходная подборка останется без изменений." @update:open="duplicateItem = null">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <Label for="dup-name" required>Название копии</Label>
          <Input id="dup-name" v-model="duplicateName" />
        </div>
        <fieldset class="flex flex-col gap-2 rounded-lg border border-border p-3.5">
          <legend class="px-1 text-sm font-medium">Что скопировать</legend>
          <label class="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox v-model="duplicateOptions.items" aria-label="Состав товаров" />
            Состав товаров
          </label>
          <label class="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox v-model="duplicateOptions.design" aria-label="Оформление и описание" />
            Оформление и описание
          </label>
          <label class="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox v-model="duplicateOptions.status" aria-label="Статус публикации" />
            Статус публикации
          </label>
        </fieldset>
      </div>
      <template #footer>
        <Button variant="outline" @click="duplicateItem = null">Отмена</Button>
        <Button :disabled="!duplicateName.trim() || busy" @click="doDuplicate">Создать копию</Button>
      </template>
    </Modal>

    <!-- Публикация с проверками -->
    <ConfirmDialog
      :open="!!publishItem"
      title="Опубликовать подборку?"
      :description="`«${publishItem?.name}» станет доступна покупателям.`"
      confirm-label="Опубликовать"
      :loading="busy"
      @update:open="publishItem = null"
      @confirm="doPublish"
    >
      <ul class="flex flex-col gap-2">
        <li v-for="check in publishChecks(publishItem!)" :key="check.label" class="flex items-center gap-2 text-sm" :class="check.ok ? 'text-success' : 'text-destructive'">
          <span class="flex size-5 items-center justify-center rounded-full text-xs font-bold" :class="check.ok ? 'bg-success/10' : 'bg-destructive/10'">
            {{ check.ok ? '✓' : '!' }}
          </span>
          {{ check.label }}
        </li>
      </ul>
    </ConfirmDialog>

    <!-- Снятие с публикации -->
    <ConfirmDialog
      :open="!!unpublishItem"
      title="Снять с публикации?"
      :description="`«${unpublishItem?.name}» перестанет быть доступна покупателям. Черновик сохранится.`"
      confirm-label="Снять с публикации"
      :loading="busy"
      @update:open="unpublishItem = null"
      @confirm="doUnpublish"
    />

    <!-- Архивация -->
    <ConfirmDialog
      :open="!!archiveItem"
      title="Архивировать подборку?"
      :description="`«${archiveItem?.name}» будет скрыта из активных. Восстановить её можно на вкладке «Архив».`"
      confirm-label="Архивировать"
      :loading="busy"
      @update:open="archiveItem = null"
      @confirm="doArchive"
    />

    <!-- Восстановление -->
    <ConfirmDialog
      :open="!!restoreItem"
      title="Восстановить подборку?"
      :description="`«${restoreItem?.name}» вернётся в активные как черновик.`"
      confirm-label="Восстановить"
      :loading="busy"
      @update:open="restoreItem = null"
      @confirm="doRestore"
    />

    <!-- Удаление -->
    <ConfirmDialog
      :open="!!deleteItem"
      title="Удалить подборку навсегда?"
      confirm-label="Удалить навсегда"
      destructive
      :loading="busy"
      @update:open="deleteItem = null"
      @confirm="doDelete"
    >
      <p class="text-sm text-muted-foreground">
        «{{ deleteItem?.name }}» будет удалена без возможности восстановления. Адрес /{{ deleteItem?.slug }} освободится.
      </p>
    </ConfirmDialog>
  </div>
</template>
