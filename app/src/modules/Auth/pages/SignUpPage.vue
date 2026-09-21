<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import Button from '@/common/shared/UI/Button.vue'
import Input from '@/common/shared/UI/Input.vue'
import Label from '@/common/shared/UI/Label.vue'

const inviteCode = ref('')
const email = ref('')
const name = ref('')
const password = ref('')
const passwordConfirm = ref('')
const submitted = ref(false)

const errors = ref<Record<string, string>>({})

// mock: истёкшие и использованные приглашения
const EXPIRED_CODES = ['MK-OLD', 'MK-EXPIRED']
const USED_CODES = ['MK-USED']

const passwordChecks = computed(() => [
  { label: 'Минимум 8 символов', ok: password.value.length >= 8 },
  { label: 'Есть цифра', ok: /\d/.test(password.value) },
  { label: 'Есть заглавная буква', ok: /[A-ZА-ЯЁ]/.test(password.value) }
])

function validate(): boolean {
  const next: Record<string, string> = {}
  const code = inviteCode.value.trim().toUpperCase()
  if (!code) next.inviteCode = 'Введите код приглашения'
  else if (EXPIRED_CODES.includes(code)) next.inviteCode = 'Приглашение истекло. Запросите новое у администратора.'
  else if (USED_CODES.includes(code)) next.inviteCode = 'Приглашение уже использовано.'
  if (!email.value.trim()) next.email = 'Введите рабочую почту'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) next.email = 'Некорректный формат почты'
  if (!name.value.trim()) next.name = 'Введите имя'
  if (!passwordChecks.value.every((c) => c.ok)) next.password = 'Пароль не соответствует требованиям'
  if (password.value !== passwordConfirm.value) next.passwordConfirm = 'Пароли не совпадают'
  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (!validate()) return
  submitted.value = true
}
</script>

<template>
  <section class="w-full max-w-md rounded-2xl border border-border bg-card p-9 shadow-lg" aria-labelledby="signup-title">
    <template v-if="!submitted">
      <div class="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">АК</div>
      <p class="text-xs font-bold tracking-widest text-primary uppercase">Marketing space</p>
      <h1 id="signup-title" class="mt-2 text-2xl font-semibold tracking-tight">Присоединиться к команде</h1>
      <p class="mt-2 mb-6 text-sm text-muted-foreground">Создайте доступ по приглашению администратора.</p>

      <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <div class="flex flex-col gap-1.5">
          <Label for="invite" required>Код приглашения</Label>
          <Input id="invite" v-model="inviteCode" placeholder="Например, MK-2026" :invalid="!!errors.inviteCode" />
          <p v-if="errors.inviteCode" class="text-sm text-destructive" role="alert">{{ errors.inviteCode }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email" required>Рабочая почта</Label>
          <Input id="email" v-model="email" type="email" placeholder="anna@company.com" :invalid="!!errors.email" autocomplete="email" />
          <p v-if="errors.email" class="text-sm text-destructive" role="alert">{{ errors.email }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="name" required>Имя</Label>
          <Input id="name" v-model="name" placeholder="Анна Ковалёва" :invalid="!!errors.name" autocomplete="name" />
          <p v-if="errors.name" class="text-sm text-destructive" role="alert">{{ errors.name }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="password" required>Пароль</Label>
          <Input id="password" v-model="password" type="password" placeholder="Придумайте пароль" :invalid="!!errors.password" autocomplete="new-password" />
          <ul class="flex flex-col gap-1" aria-live="polite">
            <li
              v-for="check in passwordChecks"
              :key="check.label"
              class="flex items-center gap-1.5 text-xs"
              :class="check.ok ? 'text-success' : 'text-muted-foreground'"
            >
              <Check class="size-3.5" aria-hidden="true" />
              {{ check.label }}
            </li>
          </ul>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="password-confirm" required>Повторите пароль</Label>
          <Input id="password-confirm" v-model="passwordConfirm" type="password" placeholder="Повторите пароль" :invalid="!!errors.passwordConfirm" autocomplete="new-password" />
          <p v-if="errors.passwordConfirm" class="text-sm text-destructive" role="alert">{{ errors.passwordConfirm }}</p>
        </div>
        <Button type="submit" size="lg">Присоединиться к команде</Button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        Уже есть доступ?
        <NuxtLink to="/sign-in" class="font-medium text-primary hover:underline">Войти</NuxtLink>
      </p>
    </template>

    <div v-else class="flex flex-col items-center py-4 text-center" role="status">
      <div class="mb-4 flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
        <Check class="size-7" aria-hidden="true" />
      </div>
      <h1 class="text-xl font-semibold">Доступ создан</h1>
      <p class="mt-2 mb-6 text-sm text-muted-foreground">
        Осталось подключить двухфакторную аутентификацию — это обязательно для всех участников команды.
      </p>
      <Button size="lg" @click="navigateTo('/sign-in')">Подключить 2FA и войти</Button>
    </div>
  </section>
</template>
