<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import Button from './Button.vue'

defineProps<{
  icon?: FunctionalComponent
  title: string
  description?: string
  actionLabel?: string
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <div v-if="icon" class="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <component :is="icon" class="size-6" aria-hidden="true" />
    </div>
    <div>
      <p class="font-medium">{{ title }}</p>
      <p v-if="description" class="mt-1 max-w-sm text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <Button v-if="actionLabel" variant="outline" size="sm" @click="emit('action')">{{ actionLabel }}</Button>
    <slot />
  </div>
</template>
