<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/common/shared/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        success: 'border-transparent bg-success/10 text-success',
        warning: 'border-transparent bg-warning/15 text-warning',
        muted: 'border-transparent bg-muted text-muted-foreground',
        destructive: 'border-transparent bg-destructive/10 text-destructive',
        outline: 'border-border text-foreground'
      },
      dot: { true: '', false: '' }
    },
    defaultVariants: { variant: 'default', dot: false }
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

withDefaults(defineProps<{ variant?: BadgeVariants['variant']; dot?: boolean; class?: string }>(), {
  variant: 'default',
  dot: false
})
</script>

<template>
  <span :class="cn(badgeVariants({ variant, dot }), $props.class)">
    <span v-if="dot" class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>
