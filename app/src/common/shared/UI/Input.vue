<script setup lang="ts">
import { cn } from '@/common/shared/utils/cn'

withDefaults(
  defineProps<{
    class?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
  }>(),
  { type: 'text' }
)

const model = defineModel<string>()
</script>

<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-destructive focus-visible:border-destructive',
        $props.class
      )
    "
  />
</template>
