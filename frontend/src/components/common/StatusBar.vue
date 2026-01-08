<script setup>
import { mqttStatus } from "@/mqtt";
</script>

<template>
    <div class="status-bar">
        <div class="status-bar__item">
            <span
                class="status-bar__indicator"
                :class="`status-bar__indicator--${mqttStatus.color}`"
            />
            <span class="status-bar__label">MQTT:</span>
            <span class="status-bar__value">{{ mqttStatus.text }}</span>
        </div>
    </div>
</template>

<style scoped>
.status-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 8px 16px;
    background-color: #f5f5f5;
    border-top: 1px solid #e0e0e0;
    font-size: 12px;
    color: #666;
}

.status-bar__item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-bar__indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-bar__indicator--red {
    background-color: #f56c6c;
}

.status-bar__indicator--orange {
    background-color: #e6a23c;
    animation: pulse 1.5s infinite;
}

.status-bar__indicator--green {
    background-color: #67c23a;
}

.status-bar__label {
    color: #999;
}

.status-bar__value {
    font-weight: 500;
    color: #333;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
</style>
