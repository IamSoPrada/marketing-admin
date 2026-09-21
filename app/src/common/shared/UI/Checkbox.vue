<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { Check } from 'lucide-vue-next'
import { cn } from '@/common/shared/utils/cn'

defineProps<{ class?: string; disabled?: boolean; ariaLabel?: string }>()
const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <CheckboxRoot
    v-model="checked"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="
      cn(
        'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border border-input bg-card shadow-xs transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50',
        $props.class
      )
    "
  >
    <CheckboxIndicator class="flex items-center justify-center">
      <Check class="size-3.5" aria-hidden="true" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
