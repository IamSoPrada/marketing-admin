<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/common/shared/UI/Button.vue'
import Input from '@/common/shared/UI/Input.vue'
import Label from '@/common/shared/UI/Label.vue'
import Checkbox from '@/common/shared/UI/Checkbox.vue'

const email = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Заполните почту и пароль'
    return
  }
  loading.value = true
  // mock: любые валидные данные переводят на 2FA
  await new Promise((resolve) => setTimeout(resolve, 400))
  loading.value = false
  await navigateTo('/two-factor')
}
</script>

<template>
  <section class="w-full max-w-md rounded-2xl border border-border bg-card p-9 shadow-lg" aria-labelledby="signin-title">
    <div class="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">АК</div>
    <p class="text-xs font-bold tracking-widest text-primary uppercase">Marketing space</p>
    <h1 id="signin-title" class="mt-2 text-2xl font-semibold tracking-tight">Войти в рабочее пространство</h1>
    <p class="mt-2 mb-6 text-sm text-muted-foreground">Используйте рабочую почту и пароль для входа.</p>

    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <Label for="email" required>Рабочая почта</Label>
        <Input id="email" v-model="email" type="email" placeholder="anna@company.com" :invalid="!!error" autocomplete="email" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="password" required>Пароль</Label>
        <Input id="password" v-model="password" type="password" placeholder="Введите пароль" :invalid="!!error" autocomplete="current-password" />
      </div>
      <p v-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
      <div class="flex items-center justify-between">
        <label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Checkbox v-model="remember" aria-label="Запомнить меня" />
          Запомнить меня
        </label>
        <NuxtLink to="/forgot-password" class="text-sm font-medium text-primary hover:underline">Забыли пароль?</NuxtLink>
      </div>
      <Button type="submit" size="lg" :disabled="loading">
        <span v-if="loading" class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        Войти
      </Button>
    </form>

    <p class="mt-6 text-center text-sm text-muted-foreground">
      Вас пригласили в команду?
      <NuxtLink to="/sign-up" class="font-medium text-primary hover:underline">Создать доступ</NuxtLink>
    </p>
  </section>
</template>
