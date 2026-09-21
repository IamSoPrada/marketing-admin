<script setup lang="ts">
import { DropdownMenuItem } from 'reka-ui'
import { cn } from '@/common/shared/utils/cn'

defineProps<{ class?: string; destructive?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <DropdownMenuItem
    :disabled="disabled"
    :class="
      cn(
        'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        destructive && 'text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive [&_svg]:text-destructive',
        $props.class
      )
    "
    @select="emit('select')"
  >
    <slot />
  </DropdownMenuItem>
</template>
