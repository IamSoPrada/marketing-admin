<script setup lang="ts">
import { computed, ref } from 'vue'
import { Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Button from '@/common/shared/UI/Button.vue'
import Card from '@/common/shared/UI/Card.vue'
import Input from '@/common/shared/UI/Input.vue'
import Label from '@/common/shared/UI/Label.vue'
import Switch from '@/common/shared/UI/Switch.vue'

const profile = ref({
  name: 'Анна Ковалёва',
  email: 'anna@playmarket.io'
})

const initials = computed(() =>
  profile.value.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const savingProfile = ref(false)

async function saveProfile() {
  savingProfile.value = true
  await new Promise((resolve) => setTimeout(resolve, 400))
  savingProfile.value = false
  toast.success('Профиль обновлён')
}

const passwordForm = ref({
  current: '',
  next: '',
  confirm: ''
})
const savingPassword = ref(false)

async function savePassword() {
  savingPassword.value = true
  await new Promise((resolve) => setTimeout(resolve, 400))
  savingPassword.value = false
  passwordForm.value = { current: '', next: '', confirm: '' }
  toast.success('Пароль изменён')
}

const twoFactorEnabled = ref(true)
</script>

<template>
  <div class="flex max-w-3xl flex-col gap-5">
    <Card class="p-6">
      <h2 class="font-semibold">Личные данные</h2>
      <p class="mt-1 mb-5 text-sm text-muted-foreground">Имя и почта видны другим участникам рабочего пространства.</p>
      <form class="flex flex-col gap-4" @submit.prevent="saveProfile">
        <div class="flex items-center gap-4">
          <span class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {{ initials }}
          </span>
          <div>
            <p class="text-sm font-medium">{{ profile.name }}</p>
            <p class="text-sm text-muted-foreground">Администратор</p>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="profile-name" required>Имя</Label>
          <Input id="profile-name" v-model="profile.name" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="profile-email" required>Рабочая почта</Label>
          <Input id="profile-email" v-model="profile.email" type="email" />
        </div>
        <div>
          <Button type="submit" :disabled="!profile.name.trim() || !profile.email.trim() || savingProfile">
            <Save aria-hidden="true" />
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Card>

    <Card class="p-6">
      <h2 class="font-semibold">Безопасность</h2>
      <p class="mt-1 mb-5 text-sm text-muted-foreground">Пароль и двухфакторная аутентификация вашего аккаунта.</p>
      <form class="flex flex-col gap-4" @submit.prevent="savePassword">
        <div class="flex flex-col gap-1.5">
          <Label for="password-current" required>Текущий пароль</Label>
          <Input id="password-current" v-model="passwordForm.current" type="password" placeholder="Введите текущий пароль" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="password-next" required>Новый пароль</Label>
            <Input id="password-next" v-model="passwordForm.next" type="password" placeholder="Минимум 8 символов" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="password-confirm" required>Повторите пароль</Label>
            <Input id="password-confirm" v-model="passwordForm.confirm" type="password" placeholder="Повторите новый пароль" />
          </div>
        </div>
        <div>
          <Button
            type="submit"
            :disabled="!passwordForm.current || passwordForm.next.length < 8 || passwordForm.next !== passwordForm.confirm || savingPassword"
          >
            <Save aria-hidden="true" />
            Изменить пароль
          </Button>
        </div>
      </form>
      <div class="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
        <div>
          <p class="text-sm font-medium">Двухфакторная аутентификация</p>
          <p class="text-sm text-muted-foreground">Код из письма или приложения при каждом входе</p>
        </div>
        <Switch v-model="twoFactorEnabled" aria-label="Двухфакторная аутентификация" />
      </div>
    </Card>
  </div>
</template>
