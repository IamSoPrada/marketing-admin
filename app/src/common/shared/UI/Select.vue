<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/common/shared/utils/cn'

defineProps<{
  class?: string
  options: { value: string; label: string }[]
  ariaLabel?: string
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div :class="cn('relative inline-flex items-center', $props.class)">
    <select
      v-model="model"
      :aria-label="ariaLabel"
      :disabled="disabled"
      class="h-10 w-full cursor-pointer appearance-none rounded-md border border-input bg-card pr-9 pl-3 text-sm text-foreground shadow-xs transition-colors focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <ChevronDown class="pointer-events-none absolute right-3 size-4 text-muted-foreground" aria-hidden="true" />
  </div>
</template>
