<script setup lang="ts">
import CollectionWizard from '@/modules/Collections/features/CollectionWizard.vue'

const route = useRoute()
</script>

<template>
  <CollectionWizard :collection-id="String(route.params.id)" />
</template>
