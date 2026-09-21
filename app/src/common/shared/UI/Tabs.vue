<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { cn } from '@/common/shared/utils/cn'

defineProps<{ tabs: { value: string; label: string; count?: number }[]; class?: string }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <TabsRoot v-model="model">
    <TabsList :class="cn('inline-flex h-11 items-center gap-1 rounded-lg bg-muted p-1', $props.class)">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined"
          class="rounded-full bg-background px-1.5 py-0.5 text-xs text-muted-foreground tabular-nums"
        >
          {{ tab.count }}
        </span>
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>
