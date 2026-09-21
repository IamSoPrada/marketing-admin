<script setup lang="ts">
import { ref } from 'vue'
import { MailCheck } from 'lucide-vue-next'
import Button from '@/common/shared/UI/Button.vue'
import Input from '@/common/shared/UI/Input.vue'
import Label from '@/common/shared/UI/Label.vue'

const email = ref('')
const sent = ref(false)
</script>

<template>
  <section class="w-full max-w-md rounded-2xl border border-border bg-card p-9 shadow-lg" aria-labelledby="forgot-title">
    <template v-if="!sent">
      <p class="text-xs font-bold tracking-widest text-primary uppercase">Восстановление</p>
      <h1 id="forgot-title" class="mt-2 text-2xl font-semibold tracking-tight">Сброс пароля</h1>
      <p class="mt-2 mb-6 text-sm text-muted-foreground">
        Укажите рабочую почту — отправим ссылку для установки нового пароля.
      </p>
      <form class="flex flex-col gap-4" @submit.prevent="sent = true">
        <div class="flex flex-col gap-1.5">
          <Label for="email" required>Рабочая почта</Label>
          <Input id="email" v-model="email" type="email" placeholder="anna@company.com" required autocomplete="email" />
        </div>
        <Button type="submit" size="lg" :disabled="!email">Отправить ссылку</Button>
      </form>
    </template>

    <div v-else class="flex flex-col items-center py-4 text-center" role="status">
      <div class="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MailCheck class="size-7" aria-hidden="true" />
      </div>
      <h1 class="text-xl font-semibold">Письмо отправлено</h1>
      <p class="mt-2 mb-6 text-sm text-muted-foreground">
        Если аккаунт с почтой {{ email }} существует, вы получите ссылку для сброса пароля.
      </p>
      <Button variant="outline" @click="navigateTo('/sign-in')">Вернуться ко входу</Button>
    </div>

    <p v-if="!sent" class="mt-6 text-center text-sm text-muted-foreground">
      Вспомнили пароль?
      <NuxtLink to="/sign-in" class="font-medium text-primary hover:underline">Войти</NuxtLink>
    </p>
  </section>
</template>
