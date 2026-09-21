<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { KeyRound, MailPlus, MoreHorizontal, Pencil, Search, Shield, UserPlus, UserX, Ban, RotateCcw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { EMPLOYEE_STATUS_LABELS, useEmployeesStore, type Employee, type EmployeeStatus } from '@/modules/Employees/shared/state/employees'
import { useRolesStore } from '@/modules/Roles/shared/state/roles'
import { formatDateTime, initials } from '@/common/shared/utils/format'
import Button from '@/common/shared/UI/Button.vue'
import Card from '@/common/shared/UI/Card.vue'
import Badge from '@/common/shared/UI/Badge.vue'
import Select from '@/common/shared/UI/Select.vue'
import Input from '@/common/shared/UI/Input.vue'
import Label from '@/common/shared/UI/Label.vue'
import Modal from '@/common/shared/UI/Modal.vue'
import ConfirmDialog from '@/common/shared/UI/ConfirmDialog.vue'
import EmptyState from '@/common/shared/UI/EmptyState.vue'
import DropdownMenu from '@/common/shared/UI/DropdownMenu.vue'
import DropdownMenuTrigger from '@/common/shared/UI/DropdownMenuTrigger.vue'
import DropdownMenuContent from '@/common/shared/UI/DropdownMenuContent.vue'
import DropdownMenuItem from '@/common/shared/UI/DropdownMenuItem.vue'
import DropdownMenuSeparator from '@/common/shared/UI/DropdownMenuSeparator.vue'

const route = useRoute()
const store = useEmployeesStore()
const rolesStore = useRolesStore()

// --- Фильтры ---
const query = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активна' },
  { value: 'pending', label: 'Ожидает активации' },
  { value: 'disabled', label: 'Отключена' }
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return store.employees.filter((e) => {
    if (q && !e.name.toLowerCase().includes(q) && !e.email.toLowerCase().includes(q)) return false
    if (statusFilter.value !== 'all' && e.status !== statusFilter.value) return false
    return true
  })
})

const statusVariant: Record<EmployeeStatus, 'success' | 'warning' | 'muted'> = {
  active: 'success',
  pending: 'warning',
  disabled: 'muted'
}

// --- Приглашение ---
const inviteOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('marketing')
const inviteError = ref('')
const busy = ref(false)

onMounted(() => {
  if (route.query.invite === '1') inviteOpen.value = true
})

const roleOptions = computed(() => rolesStore.roles.map((r) => ({ value: r.id, label: r.name })))

async function sendInvite() {
  inviteError.value = ''
  const email = inviteEmail.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    inviteError.value = 'Некорректный формат почты'
    return
  }
  busy.value = true
  const error = await store.invite(email, inviteRole.value)
  busy.value = false
  if (error) {
    inviteError.value = error
    return
  }
  inviteOpen.value = false
  inviteEmail.value = ''
  toast.success('Приглашение отправлено', { description: `Письмо отправлено на ${email}.` })
}

// --- Действия ---
const roleItem = ref<Employee | null>(null)
const roleChoice = ref('marketing')
const resetItem = ref<Employee | null>(null)
const disableItem = ref<Employee | null>(null)
const revokeItem = ref<Employee | null>(null)

function openChangeRole(employee: Employee) {
  roleItem.value = employee
  roleChoice.value = employee.roleId
}

async function doChangeRole() {
  if (!roleItem.value) return
  busy.value = true
  await store.changeRole(roleItem.value.id, roleChoice.value)
  busy.value = false
  toast.success('Роль изменена', { description: `«${rolesStore.roleName(roleChoice.value)}» назначена для ${roleItem.value.name}.` })
  roleItem.value = null
}

async function doResend(employee: Employee) {
  await store.resendInvite(employee.id)
  toast.success('Приглашение отправлено повторно', { description: employee.email })
}

async function doReset2fa() {
  if (!resetItem.value) return
  busy.value = true
  await store.resetTwoFactor(resetItem.value.id)
  busy.value = false
  toast.success('2FA сброшена', { description: `${resetItem.value.name} настроит 2FA при следующем входе.` })
  resetItem.value = null
}

async function doToggleDisable() {
  if (!disableItem.value) return
  const target = disableItem.value
  const next: EmployeeStatus = target.status === 'disabled' ? 'active' : 'disabled'
  busy.value = true
  await store.setStatus(target.id, next)
  busy.value = false
  toast.success(next === 'disabled' ? 'Учётная запись отключена' : 'Учётная запись включена', { description: target.name })
  disableItem.value = null
}

async function doRevoke() {
  if (!revokeItem.value) return
  busy.value = true
  await store.revoke(revokeItem.value.id)
  busy.value = false
  toast.success('Доступ отозван', { description: revokeItem.value.email })
  revokeItem.value = null
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Команда</h2>
        <p class="text-sm text-muted-foreground">{{ store.employees.length }} сотрудника имеют доступ к сервису</p>
      </div>
      <Button @click="inviteOpen = true">
        <UserPlus aria-hidden="true" />
        Пригласить сотрудника
      </Button>
    </div>

    <Card>
      <div class="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
        <div class="relative min-w-60 flex-1">
          <Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input v-model="query" class="pl-9" placeholder="Поиск по имени или почте" aria-label="Поиск по сотрудникам" />
        </div>
        <Select v-model="statusFilter" :options="statusOptions" aria-label="Фильтр по статусу" class="w-52" />
      </div>

      <div v-if="filtered.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th class="px-4 py-3 font-medium">Сотрудник</th>
              <th class="px-4 py-3 font-medium">Роль</th>
              <th class="px-4 py-3 font-medium">Последний вход</th>
              <th class="px-4 py-3 font-medium">Статус</th>
              <th class="px-4 py-3" aria-label="Действия" />
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="employee in filtered" :key="employee.id" class="transition-colors hover:bg-muted/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {{ initials(employee.name) }}
                  </span>
                  <div>
                    <p class="font-medium">{{ employee.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ employee.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <Badge variant="outline">{{ rolesStore.roleName(employee.roleId) }}</Badge>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{{ formatDateTime(employee.lastSeen) }}</td>
              <td class="px-4 py-3">
                <Badge :variant="statusVariant[employee.status]" dot>{{ EMPLOYEE_STATUS_LABELS[employee.status] }}</Badge>
              </td>
              <td class="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger :aria-label="`Действия для ${employee.name}`">
                    <button class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <MoreHorizontal class="size-4" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem @select="openChangeRole(employee)">
                      <Shield aria-hidden="true" />Изменить роль
                    </DropdownMenuItem>
                    <DropdownMenuItem v-if="employee.status === 'pending'" @select="doResend(employee)">
                      <MailPlus aria-hidden="true" />Отправить приглашение повторно
                    </DropdownMenuItem>
                    <DropdownMenuItem @select="resetItem = employee">
                      <KeyRound aria-hidden="true" />Сбросить 2FA
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive @select="disableItem = employee">
                      <Ban v-if="employee.status !== 'disabled'" aria-hidden="true" />
                      <RotateCcw v-else aria-hidden="true" />
                      {{ employee.status === 'disabled' ? 'Включить учётную запись' : 'Отключить учётную запись' }}
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive @select="revokeItem = employee">
                      <UserX aria-hidden="true" />Отозвать доступ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else
        :icon="Search"
        title="Никого не найдено"
        description="Попробуйте изменить запрос или сбросить фильтр статуса."
        action-label="Сбросить фильтры"
        @action="query = ''; statusFilter = 'all'"
      />
    </Card>

    <!-- Приглашение -->
    <Modal v-model="inviteOpen" title="Пригласить сотрудника" description="Сотрудник получит письмо со ссылкой для создания доступа.">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <Label for="invite-email" required>Рабочая почта</Label>
          <Input id="invite-email" v-model="inviteEmail" type="email" placeholder="name@playmarket.io" :invalid="!!inviteError" />
          <p v-if="inviteError" class="text-sm text-destructive" role="alert">{{ inviteError }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="invite-role" required>Роль</Label>
          <Select id="invite-role" v-model="inviteRole" :options="roleOptions" />
        </div>
      </div>
      <template #footer>
        <Button variant="outline" @click="inviteOpen = false">Отмена</Button>
        <Button :disabled="!inviteEmail.trim() || busy" @click="sendInvite">Отправить приглашение</Button>
      </template>
    </Modal>

    <!-- Изменение роли -->
    <Modal :open="!!roleItem" title="Изменить роль" :description="roleItem?.name" @update:open="roleItem = null">
      <div class="flex flex-col gap-1.5">
        <Label for="role-select">Роль</Label>
        <Select id="role-select" v-model="roleChoice" :options="roleOptions" />
      </div>
      <template #footer>
        <Button variant="outline" @click="roleItem = null">Отмена</Button>
        <Button :disabled="busy" @click="doChangeRole">Сохранить изменения</Button>
      </template>
    </Modal>

    <!-- Сброс 2FA -->
    <ConfirmDialog
      :open="!!resetItem"
      title="Сбросить 2FA?"
      :description="`${resetItem?.name} потеряет доступ к текущему способу подтверждения и настроит 2FA заново при следующем входе.`"
      confirm-label="Сбросить 2FA"
      :loading="busy"
      @update:open="resetItem = null"
      @confirm="doReset2fa"
    />

    <!-- Отключение / включение -->
    <ConfirmDialog
      :open="!!disableItem"
      :title="disableItem?.status === 'disabled' ? 'Включить учётную запись?' : 'Отключить учётную запись?'"
      :description="
        disableItem?.status === 'disabled'
          ? `${disableItem?.name} снова сможет войти в рабочее пространство.`
          : `${disableItem?.name} не сможет войти, пока учётная запись отключена. Данные сохранятся.`
      "
      :confirm-label="disableItem?.status === 'disabled' ? 'Включить' : 'Отключить'"
      :destructive="disableItem?.status !== 'disabled'"
      :loading="busy"
      @update:open="disableItem = null"
      @confirm="doToggleDisable"
    />

    <!-- Отзыв доступа -->
    <ConfirmDialog
      :open="!!revokeItem"
      title="Отозвать доступ?"
      confirm-label="Отозвать доступ"
      destructive
      :loading="busy"
      @update:open="revokeItem = null"
      @confirm="doRevoke"
    >
      <p class="text-sm text-muted-foreground">
        {{ revokeItem?.name }} ({{ revokeItem?.email }}) будет удалён из рабочего пространства без возможности восстановления.
      </p>
    </ConfirmDialog>
  </div>
</template>
