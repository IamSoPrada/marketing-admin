<script setup lang="ts">
import { computed, ref } from 'vue'
import { Copy, Lock, MoreHorizontal, Pencil, Plus, Shield, Trash2, WandSparkles } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { PERMISSION_GROUPS, useRolesStore, type Role } from '@/modules/Roles/shared/state/roles'
import { useEmployeesStore } from '@/modules/Employees/shared/state/employees'
import Button from '@/common/shared/UI/Button.vue'
import Card from '@/common/shared/UI/Card.vue'
import Badge from '@/common/shared/UI/Badge.vue'
import Checkbox from '@/common/shared/UI/Checkbox.vue'
import Input from '@/common/shared/UI/Input.vue'
import Textarea from '@/common/shared/UI/Textarea.vue'
import Label from '@/common/shared/UI/Label.vue'
import Modal from '@/common/shared/UI/Modal.vue'
import ConfirmDialog from '@/common/shared/UI/ConfirmDialog.vue'
import DropdownMenu from '@/common/shared/UI/DropdownMenu.vue'
import DropdownMenuTrigger from '@/common/shared/UI/DropdownMenuTrigger.vue'
import DropdownMenuContent from '@/common/shared/UI/DropdownMenuContent.vue'
import DropdownMenuItem from '@/common/shared/UI/DropdownMenuItem.vue'
import DropdownMenuSeparator from '@/common/shared/UI/DropdownMenuSeparator.vue'

const store = useRolesStore()
const employeesStore = useEmployeesStore()

const peopleCount = (roleId: string) => employeesStore.employees.filter((e) => e.roleId === roleId).length

// --- Редактор роли ---
const editorOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', description: '', permissions: [] as string[] })
const nameError = ref('')
const busy = ref(false)

const isEditing = computed(() => editingId.value !== null)
const editingRole = computed(() => (editingId.value ? store.byId(editingId.value) : undefined))

function openCreate() {
  editingId.value = null
  form.value = { name: '', description: '', permissions: ['collections.read'] }
  nameError.value = ''
  editorOpen.value = true
}

function openEdit(role: Role) {
  editingId.value = role.id
  form.value = { name: role.name, description: role.description, permissions: [...role.permissions] }
  nameError.value = ''
  editorOpen.value = true
}

function togglePermission(id: string, checked: boolean) {
  if (checked) form.value.permissions.push(id)
  else form.value.permissions = form.value.permissions.filter((p) => p !== id)
}

const isChecked = (id: string) => form.value.permissions.includes(id)

function groupState(ids: string[]): 'all' | 'some' | 'none' {
  const selected = ids.filter((id) => form.value.permissions.includes(id)).length
  if (selected === 0) return 'none'
  if (selected === ids.length) return 'all'
  return 'some'
}

function toggleGroup(ids: string[]) {
  const state = groupState(ids)
  if (state === 'all') {
    form.value.permissions = form.value.permissions.filter((p) => !ids.includes(p))
  } else {
    form.value.permissions = [...new Set([...form.value.permissions, ...ids])]
  }
}

async function save() {
  nameError.value = ''
  if (!form.value.name.trim()) {
    nameError.value = 'Укажите название роли'
    return
  }
  busy.value = true
  if (isEditing.value && editingId.value) {
    await store.update(editingId.value, {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      permissions: [...form.value.permissions]
    })
    toast.success('Роль сохранена')
  } else {
    await store.create({
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      permissions: [...form.value.permissions]
    })
    toast.success('Роль создана')
  }
  busy.value = false
  editorOpen.value = false
}

// --- Дублирование / удаление ---
const deleteItem = ref<Role | null>(null)

async function doDuplicate(role: Role) {
  const copy = await store.duplicate(role.id)
  if (copy) toast.success('Роль дублирована', { description: `Создана «${copy.name}».` })
}

async function doDelete() {
  if (!deleteItem.value) return
  busy.value = true
  await store.remove(deleteItem.value.id)
  busy.value = false
  toast.success('Роль удалена')
  deleteItem.value = null
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Роли и права</h2>
        <p class="text-sm text-muted-foreground">Гибко настройте доступ к действиям сервиса</p>
      </div>
      <Button @click="openCreate">
        <Plus aria-hidden="true" />
        Новая роль
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="role in store.roles" :key="role.id" class="flex flex-col gap-4 p-5">
        <div class="flex items-start justify-between gap-3">
          <span class="flex size-11 items-center justify-center rounded-xl" :class="role.system ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'">
            <Shield v-if="role.system" class="size-5" aria-hidden="true" />
            <WandSparkles v-else class="size-5" aria-hidden="true" />
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger :aria-label="`Действия для роли ${role.name}`">
              <button class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <MoreHorizontal class="size-4" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @select="openEdit(role)">
                <Pencil aria-hidden="true" />Редактировать роль
              </DropdownMenuItem>
              <DropdownMenuItem @select="doDuplicate(role)">
                <Copy aria-hidden="true" />Дублировать роль
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-if="!role.system" destructive @select="deleteItem = role">
                <Trash2 aria-hidden="true" />Удалить роль
              </DropdownMenuItem>
              <DropdownMenuItem v-else disabled>
                <Lock aria-hidden="true" />Системную роль нельзя удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <h3 class="font-semibold">{{ role.name }}</h3>
          <p class="mt-0.5 text-sm text-muted-foreground">{{ role.description || 'Без описания' }}</p>
        </div>
        <div class="mt-auto flex items-center justify-between">
          <Badge variant="muted">{{ peopleCount(role.id) }} {{ peopleCount(role.id) === 1 ? 'человек' : 'человек(а)' }}</Badge>
          <span class="text-xs text-muted-foreground">{{ role.permissions.length }} прав</span>
        </div>
        <Button variant="outline" size="sm" @click="openEdit(role)">Редактировать роль</Button>
      </Card>
    </div>

    <Card class="flex items-start gap-3.5 p-5">
      <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Shield class="size-5" aria-hidden="true" />
      </span>
      <div>
        <p class="font-medium">Права задаются атомарно</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Создавайте роли под разные задачи — без ограничений по количеству. Изменение прав применяется ко всем сотрудникам с этой ролью сразу после сохранения.
        </p>
      </div>
    </Card>

    <!-- Редактор роли -->
    <Modal
      v-model="editorOpen"
      :title="isEditing ? `Редактирование роли «${editingRole?.name}»` : 'Новая роль'"
      description="Название, описание и набор прав."
      size="lg"
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <Label for="role-name" required>Название роли</Label>
            <Input
              id="role-name"
              v-model="form.name"
              placeholder="Например, Контент-редактор"
              :invalid="!!nameError"
              :disabled="editingRole?.system"
            />
            <p v-if="nameError" class="text-sm text-destructive" role="alert">{{ nameError }}</p>
            <p v-if="editingRole?.system" class="text-xs text-muted-foreground">Название системной роли изменить нельзя.</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="role-desc">Описание</Label>
            <Textarea id="role-desc" v-model="form.description" :rows="1" placeholder="Для каких задач предназначена роль?" />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="group in PERMISSION_GROUPS"
            :key="group.group"
            class="overflow-hidden rounded-lg border border-border"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-2.5 border-b border-border bg-muted/50 px-4 py-2.5 text-sm font-medium"
              @click="toggleGroup(group.items.map((i) => i.id))"
            >
              <Checkbox
                :model-value="groupState(group.items.map((i) => i.id)) === 'all'"
                :aria-label="`Выбрать все права группы ${group.group}`"
                @click.stop
                @update:model-value="toggleGroup(group.items.map((i) => i.id))"
              />
              {{ group.group }}
              <span class="ml-auto text-xs font-normal text-muted-foreground">
                {{ groupState(group.items.map((i) => i.id)) === 'all' ? 'все выбраны' : groupState(group.items.map((i) => i.id)) === 'some' ? 'частично' : 'не выбраны' }}
              </span>
            </button>
            <ul class="divide-y divide-border">
              <li v-for="permission in group.items" :key="permission.id">
                <label class="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60">
                  <Checkbox
                    :model-value="isChecked(permission.id)"
                    :aria-label="permission.label"
                    @update:model-value="togglePermission(permission.id, $event)"
                  />
                  <span class="flex-1 text-sm">{{ permission.label }}</span>
                  <code class="text-xs text-muted-foreground">{{ permission.id }}</code>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <template #footer>
        <Button variant="outline" @click="editorOpen = false">Отмена</Button>
        <Button :disabled="busy" @click="save">{{ isEditing ? 'Сохранить изменения' : 'Создать роль' }}</Button>
      </template>
    </Modal>

    <!-- Удаление -->
    <ConfirmDialog
      :open="!!deleteItem"
      title="Удалить роль?"
      confirm-label="Удалить роль"
      destructive
      :loading="busy"
      @update:open="deleteItem = null"
      @confirm="doDelete"
    >
      <p class="text-sm text-muted-foreground">
        Роль «{{ deleteItem?.name }}» будет удалена.
        <template v-if="peopleCount(deleteItem?.id ?? '') > 0">
          Сотрудники с этой ролью ({{ peopleCount(deleteItem?.id ?? '') }}) потеряют связанные права — сначала назначьте им другую роль.
        </template>
      </p>
    </ConfirmDialog>
  </div>
</template>
