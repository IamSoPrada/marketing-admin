<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuPortal } from 'reka-ui'
import { cn } from '@/common/shared/utils/cn'

withDefaults(defineProps<{ class?: string; align?: 'start' | 'center' | 'end'; sideOffset?: number }>(), {
  align: 'end',
  sideOffset: 6
})
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      :align="align"
      :side-offset="sideOffset"
      :class="
        cn(
          'z-50 min-w-56 overflow-hidden rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          $props.class
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
