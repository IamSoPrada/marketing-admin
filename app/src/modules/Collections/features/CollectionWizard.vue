<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import {
  ArrowLeft, ArrowUp, ArrowDown, Check, ChevronRight, Globe, Monitor, Save, Search, Smartphone, X
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useCollectionsStore } from '@/modules/Collections/shared/state/collections'
import { useNotificationsStore } from '@/common/shared/state/notifications'
import {
  COLLECTION_TYPE_LABELS, GAMES, MIN_COLLECTION_ITEMS,
  type Collection, type CollectionType
} from '@/modules/Collections/entities/model/types'
import { slugify } from '@/common/shared/utils/format'
import Button from '@/common/shared/UI/Button.vue'
import Input from '@/common/shared/UI/Input.vue'
import Textarea from '@/common/shared/UI/Textarea.vue'
import Label from '@/common/shared/UI/Label.vue'
import Select from '@/common/shared/UI/Select.vue'
import Checkbox from '@/common/shared/UI/Checkbox.vue'
import ConfirmDialog from '@/common/shared/UI/ConfirmDialog.vue'
import { cn } from '@/common/shared/utils/cn'

const props = defineProps<{ collectionId?: string }>()

const store = useCollectionsStore()
const notificationsStore = useNotificationsStore()

const isEdit = computed(() => !!props.collectionId)
const existing = computed(() => (props.collectionId ? store.byId(props.collectionId) : undefined))

// --- Состояние формы ---
interface WizardForm {
  name: string
  slug: string
  description: string
  type: CollectionType
  itemIds: string[]
  seoTitle: string
  seoDescription: string
  primaryColor: string
}

const form = ref<WizardForm>({
  name: '',
  slug: '',
  description: '',
  type: 'manual',
  itemIds: [],
  seoTitle: '',
  seoDescription: '',
  primaryColor: '#635bff'
})

if (existing.value) {
  const c = existing.value
  form.value = {
    name: c.name,
    slug: c.slug,
    description: c.description,
    type: c.type,
    itemIds: [...c.itemIds],
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    primaryColor: c.primaryColor
  }
}

const dirty = ref(false)
watch(form, () => (dirty.value = true), { deep: true })

// --- Степпер ---
const step = ref(1)
const maxReached = ref(isEdit.value ? 4 : 1)

const steps = ['Состав', 'Предпросмотр', 'Оформление', 'Публикация']

const step1Valid = computed(() => form.value.itemIds.length >= MIN_COLLECTION_ITEMS)

const slugError = computed(() => {
  const slug = form.value.slug.trim()
  if (!slug) return 'Укажите адрес подборки'
  if (!/^[a-z0-9-]+$/.test(slug)) return 'Только строчные латинские буквы, цифры и дефис'
  if (store.isSlugTaken(slug, props.collectionId)) return 'Этот адрес уже занят'
  return ''
})

const step3Valid = computed(() => form.value.name.trim() !== '' && !slugError.value)

const seoValid = computed(() => form.value.seoTitle.trim() !== '' && form.value.seoDescription.trim() !== '')

const publishChecks = computed(() => [
  { label: `Состав: ${form.value.itemIds.length} из ${MIN_COLLECTION_ITEMS} названий`, ok: step1Valid.value, step: 1 },
  { label: 'Название заполнено', ok: form.value.name.trim() !== '', step: 3 },
  { label: 'Описание заполнено', ok: form.value.description.trim() !== '', step: 3 },
  { label: 'Адрес задан и свободен', ok: !slugError.value, step: 3 },
  { label: 'SEO title и description заполнены', ok: seoValid.value, step: 4 }
])

const canPublish = computed(() => publishChecks.value.every((c) => c.ok))

function currentStepValid(): boolean {
  if (step.value === 1) return step1Valid.value
  if (step.value === 2) return true
  if (step.value === 3) return step3Valid.value
  return true
}

function goToStep(target: number) {
  // Вперёд — только если пройдены все промежуточные шаги (или уже достигали шага)
  if (target <= maxReached.value) {
    step.value = target
    return
  }
  if (target === step.value + 1 && currentStepValid()) {
    step.value = target
    maxReached.value = Math.max(maxReached.value, target)
  }
}

function nextStep() {
  if (!currentStepValid()) return
  goToStep(step.value + 1)
}

function prevStep() {
  if (step.value > 1) step.value -= 1
}

// --- Шаг 1: состав ---
const gameFilter = ref('all')
const itemSearch = ref('')

const gameOptions = [{ value: 'all', label: 'Все игры' }, ...GAMES.map((g) => ({ value: g, label: g }))]

const catalogFiltered = computed(() => {
  const q = itemSearch.value.trim().toLowerCase()
  return store.catalog.filter((item) => {
    if (gameFilter.value !== 'all' && item.game !== gameFilter.value) return false
    if (q && !item.name.toLowerCase().includes(q)) return false
    return true
  })
})

const selectedItems = computed(() =>
  form.value.itemIds.map((id) => store.catalog.find((i) => i.id === id)).filter((i) => i !== undefined)
)

function toggleItem(id: string, checked: boolean) {
  if (checked) form.value.itemIds.push(id)
  else form.value.itemIds = form.value.itemIds.filter((itemId) => itemId !== id)
}

const isSelected = (id: string) => form.value.itemIds.includes(id)

function moveItem(index: number, direction: -1 | 1) {
  const next = index + direction
  if (next < 0 || next >= form.value.itemIds.length) return
  const ids = [...form.value.itemIds]
  const [moved] = ids.splice(index, 1)
  ids.splice(next, 0, moved!)
  form.value.itemIds = ids
}

function removeItem(id: string) {
  form.value.itemIds = form.value.itemIds.filter((itemId) => itemId !== id)
}

// --- Шаг 2: предпросмотр ---
const previewDevice = ref<'desktop' | 'mobile'>('desktop')

// --- Шаг 3: slug ---
const slugTouched = ref(isEdit.value)

watch(
  () => form.value.name,
  (name) => {
    if (!slugTouched.value) form.value.slug = slugify(name)
  }
)

// --- Сохранение / публикация ---
const saving = ref(false)

function payload() {
  return {
    name: form.value.name.trim(),
    slug: form.value.slug.trim(),
    description: form.value.description.trim(),
    type: form.value.type,
    itemIds: [...form.value.itemIds],
    seoTitle: form.value.seoTitle.trim(),
    seoDescription: form.value.seoDescription.trim(),
    primaryColor: form.value.primaryColor
  }
}

async function saveDraft() {
  saving.value = true
  if (isEdit.value && props.collectionId) {
    await store.update(props.collectionId, payload())
    toast.success('Изменения сохранены')
  } else {
    const created = await store.createDraft(payload())
    toast.success('Черновик сохранён', { description: `«${created.name || 'Без названия'}» добавлена в список подборок.` })
  }
  saving.value = false
  dirty.value = false
  await navigateTo('/collections')
}

async function publish() {
  if (!canPublish.value) return
  saving.value = true
  let id = props.collectionId
  if (isEdit.value && id) {
    await store.update(id, payload())
  } else {
    const created = await store.createDraft(payload())
    id = created.id
  }
  await store.publish(id!)
  saving.value = false
  dirty.value = false
  notificationsStore.push({ title: 'Подборка опубликована', description: `«${form.value.name}» доступна покупателям`, type: 'success' })
  toast.success('Подборка опубликована', { description: 'Страница доступна покупателям.' })
  await navigateTo('/collections')
}

// --- Защита от потери данных ---
const leaveGuardOpen = ref(false)
let pendingLeave: (() => void) | null = null

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  leaveGuardOpen.value = true
  return new Promise((resolve) => {
    pendingLeave = () => resolve(true)
  })
})

function confirmLeave() {
  leaveGuardOpen.value = false
  dirty.value = false
  pendingLeave?.()
}
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <!-- Заголовок -->
    <div class="flex items-center gap-3">
      <Button variant="outline" size="icon" aria-label="Назад к списку" @click="navigateTo('/collections')">
        <ArrowLeft aria-hidden="true" />
      </Button>
      <div>
        <p class="text-xs font-bold tracking-widest text-primary uppercase">
          {{ isEdit ? 'Редактирование подборки' : 'Новая подборка' }}
        </p>
        <h1 class="text-xl font-semibold tracking-tight">
          {{ isEdit ? form.name || 'Подборка' : 'Создание подборки' }}
        </h1>
      </div>
    </div>

    <!-- Степпер -->
    <ol class="flex rounded-xl border border-border bg-card" aria-label="Шаги создания подборки">
      <li v-for="(label, index) in steps" :key="label" class="flex-1">
        <button
          type="button"
          :aria-current="step === index + 1 ? 'step' : undefined"
          :disabled="index + 1 > maxReached && !(index + 1 === step + 1 && currentStepValid())"
          :class="
            cn(
              'flex min-h-14 w-full cursor-pointer items-center gap-2.5 px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45',
              step === index + 1 && 'text-primary',
              step > index + 1 && 'text-success',
              step !== index + 1 && step <= index + 1 && 'text-muted-foreground'
            )
          "
          @click="goToStep(index + 1)"
        >
          <span
            :class="
              cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                step === index + 1 && 'border-primary bg-primary text-primary-foreground',
                step > index + 1 && 'border-success bg-success text-success-foreground'
              )
            "
          >
            <Check v-if="step > index + 1" class="size-3.5" aria-hidden="true" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="font-medium max-md:hidden">{{ label }}</span>
        </button>
      </li>
    </ol>

    <div class="rounded-xl border border-border bg-card p-6">
      <!-- Шаг 1: Состав -->
      <div v-if="step === 1" class="flex flex-col gap-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Выберите состав</h2>
            <p class="mt-1 text-sm text-muted-foreground">Найдите нужные названия и добавьте их в подборку.</p>
          </div>
          <span
            :class="
              cn(
                'rounded-lg px-3 py-2 text-sm tabular-nums',
                step1Valid ? 'bg-success/10 text-success' : 'bg-warning/15 text-warning'
              )
            "
            role="status"
          >
            Отмечено названий: <strong>{{ form.itemIds.length }}</strong> из {{ MIN_COLLECTION_ITEMS }} минимум
          </span>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <Label for="wiz-type">Тип подборки</Label>
            <Select
              id="wiz-type"
              :model-value="form.type"
              :options="[
                { value: 'manual', label: COLLECTION_TYPE_LABELS.manual },
                { value: 'live', label: COLLECTION_TYPE_LABELS.live }
              ]"
              @update:model-value="form.type = $event as CollectionType"
            />
            <p class="text-xs text-muted-foreground">
              Живая подборка обновляет состав автоматически по правилам, ручная — только вами.
            </p>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="wiz-game">Игра</Label>
            <Select id="wiz-game" v-model="gameFilter" :options="gameOptions" />
          </div>
        </div>

        <div class="relative">
          <Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input v-model="itemSearch" class="pl-9" placeholder="Поиск по названию товара" aria-label="Поиск товара" />
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <!-- Каталог -->
          <div class="overflow-hidden rounded-lg border border-border">
            <p class="border-b border-border bg-muted/50 px-3.5 py-2 text-xs font-medium text-muted-foreground">
              Каталог · {{ catalogFiltered.length }}
            </p>
            <ul class="max-h-80 divide-y divide-border overflow-y-auto">
              <li v-for="item in catalogFiltered" :key="item.id">
                <label class="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/60">
                  <Checkbox
                    :model-value="isSelected(item.id)"
                    :aria-label="`Добавить ${item.name}`"
                    @update:model-value="toggleItem(item.id, $event)"
                  />
                  <span class="flex size-9 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                    {{ item.name.slice(0, 1) }}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium">{{ item.name }}</span>
                    <span class="block text-xs text-muted-foreground">{{ item.game }} · {{ item.groups }} групп товаров</span>
                  </span>
                </label>
              </li>
              <li v-if="!catalogFiltered.length" class="px-3.5 py-8 text-center text-sm text-muted-foreground">
                По запросу ничего не найдено
              </li>
            </ul>
          </div>

          <!-- Выбранные -->
          <div class="overflow-hidden rounded-lg border border-border">
            <p class="border-b border-border bg-muted/50 px-3.5 py-2 text-xs font-medium text-muted-foreground">
              В подборке · {{ form.itemIds.length }}
            </p>
            <ul v-if="selectedItems.length" class="max-h-80 divide-y divide-border overflow-y-auto">
              <li v-for="(item, index) in selectedItems" :key="item.id" class="flex items-center gap-2 px-3.5 py-2.5">
                <span class="w-7 text-xs text-muted-foreground tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="flex size-9 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                  {{ item.name.slice(0, 1) }}
                </span>
                <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ item.name }}</span>
                <button
                  class="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                  :disabled="index === 0"
                  :aria-label="`Поднять ${item.name}`"
                  @click="moveItem(index, -1)"
                >
                  <ArrowUp class="size-4" aria-hidden="true" />
                </button>
                <button
                  class="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                  :disabled="index === selectedItems.length - 1"
                  :aria-label="`Опустить ${item.name}`"
                  @click="moveItem(index, 1)"
                >
                  <ArrowDown class="size-4" aria-hidden="true" />
                </button>
                <button
                  class="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  :aria-label="`Убрать ${item.name}`"
                  @click="removeItem(item.id)"
                >
                  <X class="size-4" aria-hidden="true" />
                </button>
              </li>
            </ul>
            <p v-else class="px-3.5 py-8 text-center text-sm text-muted-foreground">
              Отметьте товары в каталоге слева
            </p>
          </div>
        </div>

        <p v-if="!step1Valid" class="rounded-lg bg-warning/15 px-3.5 py-2.5 text-sm text-warning" role="alert">
          Для продолжения добавьте ещё {{ MIN_COLLECTION_ITEMS - form.itemIds.length }} {{ MIN_COLLECTION_ITEMS - form.itemIds.length === 1 ? 'название' : 'названий' }}.
        </p>
      </div>

      <!-- Шаг 2: Предпросмотр -->
      <div v-else-if="step === 2" class="flex flex-col gap-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Проверьте состав</h2>
            <p class="mt-1 text-sm text-muted-foreground">Так подборку увидят покупатели.</p>
          </div>
          <div class="flex gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Устройство предпросмотра">
            <button
              :class="cn('flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm', previewDevice === 'desktop' ? 'bg-card shadow-xs' : 'text-muted-foreground')"
              @click="previewDevice = 'desktop'"
            >
              <Monitor class="size-4" aria-hidden="true" />Desktop
            </button>
            <button
              :class="cn('flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm', previewDevice === 'mobile' ? 'bg-card shadow-xs' : 'text-muted-foreground')"
              @click="previewDevice = 'mobile'"
            >
              <Smartphone class="size-4" aria-hidden="true" />Mobile
            </button>
          </div>
        </div>

        <div
          :class="
            cn(
              'mx-auto w-full rounded-xl border border-border bg-muted/40 p-5 transition-all',
              previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-full'
            )
          "
        >
          <div class="rounded-xl p-5 text-white" :style="{ backgroundColor: form.primaryColor }">
            <h3 class="text-lg font-semibold">{{ form.name || 'Название подборки' }}</h3>
            <p class="mt-1 text-sm text-white/85">{{ form.description || 'Описание появится после заполнения на шаге «Оформление»' }}</p>
          </div>
          <div :class="cn('mt-4 grid gap-2.5', previewDevice === 'desktop' ? 'grid-cols-4' : 'grid-cols-2')">
            <div v-for="item in selectedItems" :key="item.id" class="rounded-lg border border-border bg-card p-3 text-center">
              <div class="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                {{ item.name.slice(0, 1) }}
              </div>
              <p class="truncate text-xs font-medium">{{ item.name }}</p>
              <p class="text-[11px] text-muted-foreground">{{ item.groups }} групп</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Шаг 3: Оформление -->
      <div v-else-if="step === 3" class="flex flex-col gap-5">
        <div>
          <h2 class="text-lg font-semibold">Оформите страницу</h2>
          <p class="mt-1 text-sm text-muted-foreground">Эти данные будут видны покупателям.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <Label for="wiz-name" required>Название подборки</Label>
            <Input id="wiz-name" v-model="form.name" placeholder="Например, Все утки в Adopt Me" :invalid="!form.name.trim() && dirty" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="wiz-slug" required>Адрес подборки</Label>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">/</span>
              <Input
                id="wiz-slug"
                v-model="form.slug"
                placeholder="all-ducks"
                :invalid="!!slugError && slugTouched"
                @update:model-value="slugTouched = true"
              />
            </div>
            <p v-if="slugError && slugTouched" class="text-sm text-destructive" role="alert">{{ slugError }}</p>
            <p v-else-if="form.slug" class="text-sm text-success">Адрес свободен</p>
          </div>
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <Label for="wiz-desc">Короткое описание</Label>
            <Textarea id="wiz-desc" v-model="form.description" placeholder="Расскажите, что найдёт покупатель на странице" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="wiz-color">Основной цвет</Label>
            <input
              id="wiz-color"
              v-model="form.primaryColor"
              type="color"
              class="h-10 w-full cursor-pointer rounded-md border border-input bg-card p-1"
            />
          </div>
        </div>
      </div>

      <!-- Шаг 4: Публикация -->
      <div v-else class="flex flex-col gap-5">
        <div>
          <h2 class="text-lg font-semibold">Публикация</h2>
          <p class="mt-1 text-sm text-muted-foreground">Проверьте данные перед тем, как страница станет доступна покупателям.</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <Label for="wiz-seo-title" required>SEO title</Label>
            <Input id="wiz-seo-title" v-model="form.seoTitle" placeholder="Заголовок для поисковика" :invalid="!form.seoTitle.trim() && dirty" />
            <p class="text-xs text-muted-foreground tabular-nums">{{ form.seoTitle.length }}/60</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="wiz-seo-desc" required>SEO description</Label>
            <Input id="wiz-seo-desc" v-model="form.seoDescription" placeholder="Описание для поисковика" :invalid="!form.seoDescription.trim() && dirty" />
            <p class="text-xs text-muted-foreground tabular-nums">{{ form.seoDescription.length }}/160</p>
          </div>
        </div>

        <ul class="flex flex-col gap-2 rounded-xl border border-border p-4">
          <li
            v-for="check in publishChecks"
            :key="check.label"
            class="flex items-center gap-3 text-sm"
          >
            <span
              :class="
                cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  check.ok ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                )
              "
            >
              <Check v-if="check.ok" class="size-3.5" aria-hidden="true" />
              <X v-else class="size-3.5" aria-hidden="true" />
            </span>
            <span :class="check.ok ? 'text-foreground' : 'text-muted-foreground'">{{ check.label }}</span>
            <button
              v-if="!check.ok && check.step !== 4"
              type="button"
              class="cursor-pointer text-xs font-medium text-primary hover:underline"
              @click="goToStep(check.step)"
            >
              Перейти к шагу
            </button>
          </li>
        </ul>

        <p v-if="!canPublish" class="rounded-lg bg-muted px-3.5 py-2.5 text-sm text-muted-foreground" role="status">
          Кнопка «Опубликовать» станет доступна, когда все проверки будут пройдены.
        </p>
      </div>
    </div>

    <!-- Футер -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Button variant="ghost" :disabled="saving" @click="saveDraft">
        <Save aria-hidden="true" />
        Сохранить черновик
      </Button>
      <div class="flex gap-2">
        <Button v-if="step > 1" variant="outline" @click="prevStep">
          <ArrowLeft aria-hidden="true" />
          Назад
        </Button>
        <Button v-if="step < 4" :disabled="!currentStepValid()" @click="nextStep">
          Продолжить
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button v-else :disabled="!canPublish || saving" @click="publish">
          <span v-if="saving" class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          <Globe v-else aria-hidden="true" />
          Опубликовать
        </Button>
      </div>
    </div>

    <!-- Защита от потери данных -->
    <ConfirmDialog
      v-model="leaveGuardOpen"
      title="Уйти без сохранения?"
      description="В подборке есть несохранённые изменения. Они будут потеряны."
      confirm-label="Уйти без сохранения"
      destructive
      @confirm="confirmLeave"
    />
  </div>
</template>
