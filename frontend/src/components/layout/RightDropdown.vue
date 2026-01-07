<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/stores";
import "./RightDropdown.css";

const userStore = useUserStore();

const showDropdown = ref(false);

const props = defineProps({
    userName: String,
});

const emit = defineEmits(["setting"]);

// 切换下拉菜单
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

// 设置服务器地址
const handleSetting = async () => {
    showDropdown.value = false;
    emit("setting");
};

// 退出登录
const handleLogout = () => {
    closeDropdown();
    userStore.logout();
    window.location.href = "/login";
};

// 关闭下拉菜单
const closeDropdown = () => {
    showDropdown.value = false;
};

// 点击外部关闭下拉菜单
const handleClickOutside = (e) => {
    const dropdown = document.querySelector(".user-dropdown");
    const trigger = document.querySelector(".user-dropdown__trigger");
    if (
        dropdown &&
        !dropdown.contains(e.target) &&
        trigger &&
        !trigger.contains(e.target)
    ) {
        showDropdown.value = false;
    }
};

// 监听点击事件，点击外部关闭下拉菜单
onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

// 移除监听事件
onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>
<template>
    <div class="user-dropdown">
        <div class="user-dropdown__trigger" @click="toggleDropdown">
            <span class="user-dropdown__name">{{ props.userName }}</span>
            <span
                class="user-dropdown__arrow"
                :class="{ 'user-dropdown__arrow--open': showDropdown }"
            >
                ▼
            </span>
        </div>
        <transition name="dropdown">
            <div v-if="showDropdown" class="user-dropdown__menu">
                <div class="user-dropdown__item" @click="handleSetting">
                    <span class="user-dropdown__icon">⚙️</span>
                    <span>系统设置</span>
                </div>
                <div class="user-dropdown__divider"></div>
                <div
                    class="user-dropdown__item user-dropdown__item--danger"
                    @click="handleLogout"
                >
                    <span class="user-dropdown__icon">🚪</span>
                    <span>退出登录</span>
                </div>
            </div>
        </transition>
    </div>
</template>
