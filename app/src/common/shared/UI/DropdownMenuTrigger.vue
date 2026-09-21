<script setup lang="ts">
import { DropdownMenuTrigger } from 'reka-ui'

defineProps<{ ariaLabel?: string }>()
</script>

<template>
  <DropdownMenuTrigger as-child :aria-label="ariaLabel">
    <slot />
  </DropdownMenuTrigger>
</template>
