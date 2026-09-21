<script setup lang="ts">
import { ref } from 'vue'
import { Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/common/shared/state/workspace'
import Button from '@/common/shared/UI/Button.vue'
import Card from '@/common/shared/UI/Card.vue'
import Input from '@/common/shared/UI/Input.vue'
import Textarea from '@/common/shared/UI/Textarea.vue'
import Label from '@/common/shared/UI/Label.vue'
import Select from '@/common/shared/UI/Select.vue'
import Switch from '@/common/shared/UI/Switch.vue'

const workspaceStore = useWorkspaceStore()

const current = workspaceStore.current!

const form = ref({
  name: current.name,
  description: current.description,
  color: current.color,
  access: current.access
})

const saving = ref(false)

async function save() {
  saving.value = true
  await workspaceStore.update(current.id, { ...form.value })
  saving.value = false
  toast.success('Настройки сохранены')
}

// Уведомления (mock, локальные предпочтения)
const notifications = ref({
  publish: true,
  invites: true,
  weekly: false
})
</script>

<template>
  <div class="flex max-w-3xl flex-col gap-5">
    <Card class="p-6">
      <h2 class="font-semibold">Рабочее пространство</h2>
      <p class="mt-1 mb-5 text-sm text-muted-foreground">Название, описание и оформление видны всей команде.</p>
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <div class="flex flex-col gap-1.5">
          <Label for="ws-name" required>Название</Label>
          <Input id="ws-name" v-model="form.name" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="ws-desc">Описание</Label>
          <Textarea id="ws-desc" v-model="form.description" :rows="2" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="ws-color">Цвет</Label>
            <input id="ws-color" v-model="form.color" type="color" class="h-10 w-full cursor-pointer rounded-md border border-input bg-card p-1" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="ws-access">Уровень доступа</Label>
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
        <div>
          <Button type="submit" :disabled="!form.name.trim() || saving">
            <Save aria-hidden="true" />
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Card>

    <Card class="p-6">
      <h2 class="font-semibold">Уведомления</h2>
      <p class="mt-1 mb-5 text-sm text-muted-foreground">Какие события присылать вам в панель и на почту.</p>
      <ul class="flex flex-col divide-y divide-border">
        <li class="flex items-center justify-between gap-4 py-3.5">
          <div>
            <p class="text-sm font-medium">Публикации подборок</p>
            <p class="text-sm text-muted-foreground">Кто-то из команды опубликовал или снял с публикации подборку</p>
          </div>
          <Switch v-model="notifications.publish" aria-label="Уведомления о публикациях" />
        </li>
        <li class="flex items-center justify-between gap-4 py-3.5">
          <div>
            <p class="text-sm font-medium">Приглашения сотрудников</p>
            <p class="text-sm text-muted-foreground">Приглашение принято или истекло</p>
          </div>
          <Switch v-model="notifications.invites" aria-label="Уведомления о приглашениях" />
        </li>
        <li class="flex items-center justify-between gap-4 py-3.5">
          <div>
            <p class="text-sm font-medium">Еженедельная сводка</p>
            <p class="text-sm text-muted-foreground">Дайджест по подборкам и команде раз в неделю</p>
          </div>
          <Switch v-model="notifications.weekly" aria-label="Еженедельная сводка" />
        </li>
      </ul>
    </Card>

    <Card class="border-destructive/30 p-6">
      <h2 class="font-semibold text-destructive">Опасная зона</h2>
      <p class="mt-1 mb-4 text-sm text-muted-foreground">
        Удаление рабочего пространства необратимо: будут удалены все подборки, роли и доступы.
      </p>
      <Button variant="destructive" disabled title="Недоступно в mock-версии">Удалить пространство</Button>
    </Card>
  </div>
</template>
