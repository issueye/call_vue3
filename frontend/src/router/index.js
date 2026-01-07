import { createRouter, createWebHistory } from "vue-router";
import CONSTANTS from "@/constants";

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
    children: [
      {
        path: "workbench",
        name: "Workbench",
        component: () => import("@/views/Layout.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem(CONSTANTS.LIMETOKEN_KEY);
  if (!to.meta.public && !token) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
