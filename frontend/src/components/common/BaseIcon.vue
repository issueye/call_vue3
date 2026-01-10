<template>
    <span
        :class="['base-icon', `base-icon--${size}`, customClass]"
        v-html="iconSvg"
        v-bind="$attrs"
    />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    name: {
        type: String,
        required: true,
        validator: (value) => {
            return [
                "hospital",
                "stethoscope",
                "user",
                "lock",
                "settings",
                "building",
                "logout",
                "clipboard",
                "speaker",
                "call",
            ].includes(value);
        },
    },
    size: {
        type: String,
        default: "md",
        validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value),
    },
    customClass: {
        type: String,
        default: "",
    },
});

// 图标映射
const icons = {
    hospital: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M8 9v4"/><path d="M12 9v4"/><path d="M16 9v4"/><path d="M8 17h8"/><path d="M3 21v-6h18v6"/></svg>`,
    stethoscope: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v6"/><path d="M11 10v3"/><path d="M11 13a4 4 0 0 1 4 4v3"/><path d="M15 20a2 2 0 0 1-4 0"/><circle cx="11" cy="2" r="2"/><path d="M11 2a5 5 0 0 1 5 5v6"/><path d="M7 11v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>`,
    lock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    building: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
    clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    call: `<svg t="1768019917772" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12792" width="24" height="24"><path d="M531.000889 859.591111a80.099556 80.099556 0 0 1-31.857778-7.054222l-2.161778-0.967111-191.544889-122.88H216.007111a128.170667 128.170667 0 0 1-128.796444-128.341334V403.171556A128.341333 128.341333 0 0 1 216.007111 274.773333h89.372445l191.544888-123.050666 2.275556-0.967111c23.210667-10.012444 46.762667-8.988444 64.682667 2.787555 16.896 11.093333 26.567111 30.378667 26.567111 52.963556v590.336c0 22.755556-9.671111 42.097778-26.567111 53.191111-9.784889 6.314667-21.219556 9.671111-32.881778 9.500444z m-6.030222-61.269333a19.342222 19.342222 0 0 0 5.347555 1.251555 15.644444 15.644444 0 0 0 0.227556-2.730666V206.563556a14.449778 14.449778 0 0 0-0.227556-2.616889 18.318222 18.318222 0 0 0-5.347555 1.137777l-201.955556 129.706667H216.007111a68.664889 68.664889 0 0 0-63.658667 42.154667c-3.413333 8.305778-5.176889 17.237333-5.12 26.225778v197.176888a68.266667 68.266667 0 0 0 68.778667 68.380445h106.951111l202.012445 129.592889z m272.042666 59.960889a29.923556 29.923556 0 0 1-21.219555-8.817778L648.760889 722.488889a29.980444 29.980444 0 1 1 42.439111-42.496l126.976 127.032889a29.980444 29.980444 0 0 1-21.162667 51.2z m-127.032889-528.042667a29.980444 29.980444 0 0 1-21.219555-51.2l127.032889-126.976a29.980444 29.980444 0 0 1 42.439111 42.382222L691.2 321.479111a29.923556 29.923556 0 0 1-21.219556 8.760889z m228.010667 201.500444h-193.308444a29.980444 29.980444 0 0 1 0-60.017777h193.308444a29.980444 29.980444 0 1 1 0 60.017777z" fill="#707070" p-id="12793"></path></svg>`,
    speaker: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M11 11a5 5 0 0 1 0-10"/><path d="m16 16-3-3"/><path d="m20 12-3-3"/></svg>`,
};

const iconSvg = computed(() => icons[props.name] || "");
</script>

<style scoped>
.base-icon {
    display: inline-block;
    vertical-align: middle;
    color: currentColor;
    transition: transform var(--transition-normal);
}

.base-icon :deep(svg) {
    width: 100%;
    height: 100%;
}

/* 图标尺寸 - 使用 CSS 变量 */
.base-icon--xs {
    width: var(--font-xs);
    height: var(--font-xs);
}

.base-icon--sm {
    width: var(--font-sm);
    height: var(--font-sm);
}

.base-icon--md {
    width: var(--font-md);
    height: var(--font-md);
}

.base-icon--lg {
    width: var(--font-lg);
    height: var(--font-lg);
}

.base-icon--xl {
    width: var(--font-xxl);
    height: var(--font-xxl);
}

/* 无障碍设计 - 焦点样式 */
.base-icon:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
}
</style>
