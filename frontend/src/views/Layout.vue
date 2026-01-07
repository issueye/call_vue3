<script setup>
import { onMounted } from "vue";
import { WorkbenchLayout } from "@/components/layout";

onMounted(() => {
    console.log("初始化工作台");
});
</script>

<template>
    <div class="main-layout">
        <WorkbenchLayout />
    </div>
</template>

<style scoped>
.main-layout {
    height: 100vh;
}
</style>
