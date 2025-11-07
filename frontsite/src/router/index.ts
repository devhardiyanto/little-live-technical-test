import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { BProgress } from "@bprogress/core";
import { useAuthStore } from "@/stores/auth";

import auth from "@/router/auth";
import payment from "@/router/payment";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/login",
  },
  ...auth,
  ...payment,
]

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: "active",
  linkExactActiveClass: "active",
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
});

router.beforeEach((to, _from, next) => {
  if (to.name) BProgress.start();

  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next({ name: 'login' });
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // Redirect to tasks if user is already logged in and tries to access login
    next({ name: 'payment' });
  } else {
    next();
  }
});

router.afterEach(() => {
  BProgress.done(); // (alias `done()` = stop)
});

export default router;
