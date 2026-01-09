import { createRouter, createWebHashHistory } from "vue-router";
import CONSTANTS from "@/constants";
import { useUserStore } from "@/stores";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { public: true },
  },
  {
    path: "/workbench",
    name: "Workbench",
    component: () => import("@/views/Layout.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Store 恢复标记
let isStoreHydrated = false;

const PINIA_KEY = "call-client-user";

// 监听 pinia store 恢复完成
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();

  // 等待 pinia persist 从 localStorage 恢复数据
  // 如果 localStorage 中有数据但 store 中没有，说明还没恢复完成
  if (!isStoreHydrated) {
    const hasStoredData = localStorage.getItem(PINIA_KEY);
    if (hasStoredData && !userStore.limeToken) {
      // 等待最多 500ms 让 store 恢复
      let attempts = 0;
      while (!userStore.limeToken && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }
    }
    isStoreHydrated = true;
  }

  const isLoggedIn = userStore.isLoggedIn;

  if (!to.meta.public && !isLoggedIn) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
