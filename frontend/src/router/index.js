import { createRouter, createWebHistory } from "vue-router";
import CONSTANTS from "@/constants";
import { useUserStore } from "@/stores";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    redirect: "/workbench",
  },
  {
    path: "/workbench",
    name: "Workbench",
    component: () => import("@/views/Layout.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  // 从 Pinia Store 读取登录状态，而不是从 localStorage
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;

  if (!to.meta.public && !isLoggedIn) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
