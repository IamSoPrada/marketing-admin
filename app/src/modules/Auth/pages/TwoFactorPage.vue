<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import Button from '@/common/shared/UI/Button.vue'
import Input from '@/common/shared/UI/Input.vue'
import Label from '@/common/shared/UI/Label.vue'

const backupMode = ref(false)
const code = ref('')
const error = ref('')
const attempts = ref(0)
const MAX_ATTEMPTS = 5

// Повторная отправка с таймером
const resendIn = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

function startResendTimer() {
  resendIn.value = 30
  timer = setInterval(() => {
    resendIn.value -= 1
    if (resendIn.value <= 0 && timer) clearInterval(timer)
  }, 1000)
}

onUnmounted(() => timer && clearInterval(timer))

const blocked = computed(() => attempts.value >= MAX_ATTEMPTS)

async function submit() {
  error.value = ''
  if (!code.value.trim()) {
    error.value = backupMode.value ? 'Введите резервный код' : 'Введите 6-значный код'
    return
  }
  if (!backupMode.value && !/^\d{6}$/.test(code.value.trim())) {
    error.value = 'Код состоит из 6 цифр'
    return
  }
  // mock: код 000000 считается неверным, остальные — верными
  if (!backupMode.value && code.value.trim() === '000000') {
    attempts.value += 1
    error.value = blocked.value
      ? 'Превышено число попыток. Повторите через 10 минут.'
      : `Неверный код. Осталось попыток: ${MAX_ATTEMPTS - attempts.value}`
    return
  }
  await navigateTo('/overview')
}

function resend() {
  startResendTimer()
}
</script>

<template>
  <section class="w-full max-w-md rounded-2xl border border-border bg-card p-9 shadow-lg" aria-labelledby="twofactor-title">
    <div class="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">2FA</div>
    <p class="text-xs font-bold tracking-widest text-primary uppercase">Проверка входа</p>
    <h1 id="twofactor-title" class="mt-2 text-2xl font-semibold tracking-tight">Введите код подтверждения</h1>
    <p class="mt-2 mb-6 text-sm text-muted-foreground">
      {{ backupMode ? 'Введите один из резервных кодов, сохранённых при подключении 2FA.' : 'Мы отправили 6-значный код в приложение-аутентификатор.' }}
    </p>

    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <Label for="code" required>{{ backupMode ? 'Резервный код' : 'Код подтверждения' }}</Label>
        <Input
          id="code"
          v-model="code"
          class="text-center tracking-[0.45em]"
          :placeholder="backupMode ? 'ABCD-EFGH' : '000000'"
          :maxlength="backupMode ? 12 : 6"
          :invalid="!!error"
          :disabled="blocked"
          :inputmode="backupMode ? 'text' : 'numeric'"
        />
      </div>
      <p v-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
      <Button type="submit" size="lg" :disabled="blocked">Подтвердить вход</Button>
    </form>

    <div class="mt-5 flex flex-col items-center gap-2">
      <button class="cursor-pointer text-sm font-medium text-primary hover:underline" type="button" @click="backupMode = !backupMode; error = ''; code = ''">
        {{ backupMode ? 'Вернуться к коду из приложения' : 'Использовать резервный код' }}
      </button>
      <button
        v-if="!backupMode"
        class="cursor-pointer text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        :disabled="resendIn > 0"
        @click="resend"
      >
        {{ resendIn > 0 ? `Отправить код повторно через ${resendIn} с` : 'Отправить код повторно' }}
      </button>
    </div>
  </section>
</template>
