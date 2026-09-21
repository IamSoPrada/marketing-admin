<script setup lang="ts">
import Modal from './Modal.vue'
import Button from './Button.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
    loading?: boolean
  }>(),
  { confirmLabel: 'Подтвердить', cancelLabel: 'Отмена' }
)

const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>({ default: false })
</script>

<template>
  <Modal v-model="open" :title="title" :description="description" size="sm">
    <slot />
    <template #footer>
      <Button variant="outline" :disabled="loading" @click="open = false">{{ cancelLabel }}</Button>
      <Button :variant="destructive ? 'destructive' : 'default'" :disabled="loading" @click="emit('confirm')">
        <span v-if="loading" class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        {{ confirmLabel }}
      </Button>
    </template>
  </Modal>
</template>
