<script setup>
import './SvgIcon.css'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})
</script>

<template>
  <svg
    class="svg-icon"
    :style="{ width: `${size}px`, height: `${size}px`, color }"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <use :href="`/icons.svg#icon-${icon}`" />
  </svg>
</template>
