<script setup lang="ts">
import { Label } from 'reka-ui'
import { cn } from '@/common/shared/utils/cn'

defineProps<{ class?: string; for?: string; required?: boolean }>()
</script>

<template>
  <Label :for="$props.for" :class="cn('text-sm font-medium leading-none text-foreground', $props.class)">
    <slot />
    <span v-if="required" class="ml-0.5 text-destructive" aria-hidden="true">*</span>
  </Label>
</template>
