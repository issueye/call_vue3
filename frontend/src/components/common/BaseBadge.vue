<script setup>
import "./BaseBadge.css";

defineProps({
    text: String,
    type: {
        type: String,
        default: "primary",
    },
});
</script>

<template>
    <span :class="['base-badge', `base-badge--${type || 'primary'}`]">
        <slot>{{ text }}</slot>
    </span>
</template>
