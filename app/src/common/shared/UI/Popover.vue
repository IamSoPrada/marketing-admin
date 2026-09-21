<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { cn } from '@/common/shared/utils/cn'

withDefaults(defineProps<{ class?: string; align?: 'start' | 'center' | 'end'; sideOffset?: number }>(), {
  align: 'end',
  sideOffset: 8
})

const open = defineModel<boolean>({ required: false })
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :align="align"
        :side-offset="sideOffset"
        :class="
          cn(
            'z-50 w-80 rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            $props.class
          )
        "
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
