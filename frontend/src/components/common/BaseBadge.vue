<script setup>
defineProps({
  text: String,
  type: {
    type: String,
    default: 'primary'
  }
})
</script>

<template>
  <span class="base-badge" :class="[`base-badge--${type || 'primary'}`]">
    <slot>{{ text }}</slot>
  </span>
</template>
