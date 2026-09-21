<script setup lang="ts">
import { cn } from '@/common/shared/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <div :class="cn('rounded-xl border border-border bg-card text-card-foreground shadow-xs', $props.class)">
    <slot />
  </div>
</template>
