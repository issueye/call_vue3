<script setup>
import "./BaseBadge.css";

const props = defineProps({
    text: String,
    type: {
        type: String,
        default: "primary",
    },
    size: {
        type: String,
        default: "md",
        validator: (value) => ["sm", "md"].includes(value),
    },
});
</script>

<template>
    <span
        :class="[
            'base-badge',
            `base-badge--${type || 'primary'}`,
            `base-badge--${size}`,
        ]"
    >
        <slot>{{ text }}</slot>
    </span>
</template>
