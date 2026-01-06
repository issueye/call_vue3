<script setup>
import { computed } from 'vue'
import './BaseButton.css'

const props = defineProps({
  type: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'default'
  },
  gradient: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const classes = computed(() => [
  'base-button',
  `base-button--${props.type}`,
  `base-button--${props.size}`,
  {
    'base-button--gradient': props.gradient,
    'base-button--disabled': props.disabled,
    'base-button--loading': props.loading,
    'base-button--block': props.block
  }
])

const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}
</script>

<template>
  <button :class="classes" @click="handleClick" :disabled="disabled">
    <span v-if="loading" class="base-button__spinner" />
    <span class="base-button__content">
      <slot />
    </span>
  </button>
</template>
