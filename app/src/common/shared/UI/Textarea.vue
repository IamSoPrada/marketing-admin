<script setup lang="ts">
import { cn } from '@/common/shared/utils/cn'

defineProps<{ class?: string; placeholder?: string; rows?: number; invalid?: boolean }>()
const model = defineModel<string>()
</script>

<template>
  <textarea
    v-model="model"
    :rows="rows ?? 3"
    :placeholder="placeholder"
    :aria-invalid="invalid || undefined"
    :class="
      cn(
        'flex min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring disabled:opacity-50',
        invalid && 'border-destructive',
        $props.class
      )
    "
  />
</template>
