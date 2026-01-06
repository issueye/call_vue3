<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import './CallButtons.css'

const props = defineProps({
  patient: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['next', 'recall', 'skip'])
</script>

<template>
  <div class="call-buttons">
    <BaseButton
      type="primary"
      size="large"
      class="call-buttons__btn call-buttons__next"
      gradient
      @click="emit('next')"
    >
      下一位
    </BaseButton>

    <BaseButton
      type="success"
      size="large"
      class="call-buttons__btn call-buttons__recall"
      @click="emit('recall')"
    >
      重呼
    </BaseButton>

    <BaseButton
      type="danger"
      size="large"
      class="call-buttons__btn call-buttons__skip"
      @click="emit('skip')"
    >
      过号
    </BaseButton>
  </div>
</template>
