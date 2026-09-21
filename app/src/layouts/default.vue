<script setup lang="ts">
import AppSidebar from '@/common/widgets/AppSidebar.vue'
import AppHeader from '@/common/widgets/AppHeader.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main class="min-h-0 flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
