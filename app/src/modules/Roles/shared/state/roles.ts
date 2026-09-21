import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockDelay, nextId } from '@/common/shared/api/mock'

export interface Permission {
  id: string
  label: string
  group: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  /** Системные роли нельзя удалять и переименовывать. */
  system?: boolean
}

export const PERMISSION_GROUPS: { group: string; items: Permission[] }[] = [
  {
    group: 'Подборки',
    items: [
      { id: 'collections.read', label: 'Просмотр подборок', group: 'Подборки' },
      { id: 'collections.create', label: 'Создание подборок', group: 'Подборки' },
      { id: 'collections.edit', label: 'Редактирование подборок', group: 'Подборки' },
      { id: 'collections.publish', label: 'Публикация и снятие с публикации', group: 'Подборки' },
      { id: 'collections.delete', label: 'Удаление и архивация', group: 'Подборки' }
    ]
  },
  {
    group: 'Сотрудники',
    items: [
      { id: 'team.read', label: 'Просмотр сотрудников', group: 'Сотрудники' },
      { id: 'team.invite', label: 'Приглашение сотрудников', group: 'Сотрудники' },
      { id: 'team.manage', label: 'Изменение ролей и отключение', group: 'Сотрудники' }
    ]
  },
  {
    group: 'Роли и настройки',
    items: [
      { id: 'roles.manage', label: 'Управление ролями и правами', group: 'Роли и настройки' },
      { id: 'workspace.manage', label: 'Настройки рабочего пространства', group: 'Роли и настройки' }
    ]
  }
]

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.id))

const initialRoles: Role[] = [
  {
    id: 'admin',
    name: 'Администратор',
    description: 'Полный доступ ко всем разделам и операциям.',
    permissions: [...ALL_PERMISSIONS],
    system: true
  },
  {
    id: 'marketing',
    name: 'Маркетинг',
    description: 'Создание, редактирование и публикация подборок.',
    permissions: ['collections.read', 'collections.create', 'collections.edit', 'collections.publish']
  }
]

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([...initialRoles])

  const byId = (id: string) => roles.value.find((r) => r.id === id)
  const roleName = (id: string) => byId(id)?.name ?? '—'

  async function create(payload: Omit<Role, 'id'>): Promise<Role> {
    await mockDelay()
    const role: Role = { ...payload, id: nextId('role') }
    roles.value.push(role)
    return role
  }

  async function update(id: string, patch: Partial<Omit<Role, 'id'>>): Promise<void> {
    await mockDelay()
    const role = byId(id)
    if (!role) return
    if (role.system && patch.name) patch = { ...patch, name: role.name }
    Object.assign(role, patch)
  }

  async function duplicate(id: string): Promise<Role | undefined> {
    await mockDelay()
    const source = byId(id)
    if (!source) return undefined
    const copy: Role = {
      ...source,
      id: nextId('role'),
      name: `${source.name} — копия`,
      permissions: [...source.permissions],
      system: false
    }
    roles.value.push(copy)
    return copy
  }

  async function remove(id: string): Promise<void> {
    await mockDelay()
    roles.value = roles.value.filter((r) => r.id !== id || r.system)
  }

  return { roles, byId, roleName, create, update, duplicate, remove }
})
