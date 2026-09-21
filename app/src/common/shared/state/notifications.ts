import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { nextId } from '@/common/shared/api/mock'

export interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: 'success' | 'info' | 'warning'
}

const initialNotifications: AppNotification[] = [
  {
    id: 'ntf-1',
    title: 'Подборка опубликована',
    description: '«Пасхальная коллекция» доступна покупателям',
    time: '2026-09-20T16:08:00',
    read: false,
    type: 'success'
  },
  {
    id: 'ntf-2',
    title: 'Приглашение отправлено',
    description: 'elena@playmarket.io приглашена с ролью «Маркетинг»',
    time: '2026-09-19T11:20:00',
    read: false,
    type: 'info'
  },
  {
    id: 'ntf-3',
    title: 'Черновик требует внимания',
    description: 'В подборке «Все утки» меньше 8 названий',
    time: '2026-09-18T09:45:00',
    read: true,
    type: 'warning'
  }
]

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<AppNotification[]>([...initialNotifications])

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  function push(payload: Omit<AppNotification, 'id' | 'time' | 'read'>) {
    notifications.value.unshift({
      ...payload,
      id: nextId('ntf'),
      time: new Date().toISOString(),
      read: false
    })
  }

  function markAllRead() {
    notifications.value.forEach((n) => (n.read = true))
  }

  return { notifications, unreadCount, push, markAllRead }
})
