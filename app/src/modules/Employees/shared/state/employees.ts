import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockDelay, nextId } from '@/common/shared/api/mock'

export type EmployeeStatus = 'active' | 'pending' | 'disabled'

export interface Employee {
  id: string
  name: string
  email: string
  roleId: string
  status: EmployeeStatus
  lastSeen: string | null
}

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Активна',
  pending: 'Ожидает активации',
  disabled: 'Отключена'
}

const initialEmployees: Employee[] = [
  { id: 'emp-1', name: 'Анна Ковалёва', email: 'anna@playmarket.io', roleId: 'admin', status: 'active', lastSeen: '2026-09-21T12:31:00' },
  { id: 'emp-2', name: 'Михаил Соколов', email: 'mikhail@playmarket.io', roleId: 'marketing', status: 'active', lastSeen: '2026-09-21T09:14:00' },
  { id: 'emp-3', name: 'Елена Лебедева', email: 'elena@playmarket.io', roleId: 'marketing', status: 'pending', lastSeen: null }
]

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([...initialEmployees])

  const byEmail = (email: string) =>
    employees.value.find((e) => e.email.toLowerCase() === email.trim().toLowerCase())

  /** Возвращает строку ошибки или null при успехе. */
  async function invite(email: string, roleId: string): Promise<string | null> {
    await mockDelay()
    if (byEmail(email)) return 'Сотрудник с такой почтой уже есть в команде'
    employees.value.unshift({
      id: nextId('emp'),
      name: email.split('@')[0] ?? email,
      email: email.trim(),
      roleId,
      status: 'pending',
      lastSeen: null
    })
    return null
  }

  async function resendInvite(id: string): Promise<void> {
    await mockDelay()
    // mock: письмо «отправлено», статус не меняется
  }

  async function changeRole(id: string, roleId: string): Promise<void> {
    await mockDelay()
    const employee = employees.value.find((e) => e.id === id)
    if (employee) employee.roleId = roleId
  }

  async function rename(id: string, name: string): Promise<void> {
    await mockDelay()
    const employee = employees.value.find((e) => e.id === id)
    if (employee) employee.name = name
  }

  async function setStatus(id: string, status: EmployeeStatus): Promise<void> {
    await mockDelay()
    const employee = employees.value.find((e) => e.id === id)
    if (employee) employee.status = status
  }

  async function resetTwoFactor(id: string): Promise<void> {
    await mockDelay()
    // mock: 2FA сброшена
  }

  async function revoke(id: string): Promise<void> {
    await mockDelay()
    employees.value = employees.value.filter((e) => e.id !== id)
  }

  return { employees, byEmail, invite, resendInvite, changeRole, rename, setStatus, resetTwoFactor, revoke }
})
