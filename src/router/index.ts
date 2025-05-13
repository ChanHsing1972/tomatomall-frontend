import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    {
      path: "/login",
      component: () => import("../views/account/Login.vue"),
      meta: { title: "登录" },
    },
    {
      path: "/register",
      component: () => import("../views/account/Register.vue"),
      meta: { title: "注册" },
    },
    {
      path: "/home",
      component: () => import("../views/Home.vue"),
      meta: { title: "番茄书城" },
    },
    {
      path: "/dashboard",
      component: () => import("../views/account/Dashboard.vue"),
      meta: { title: "个人信息" },
    },
    {
      path: "/cart",
      component: () => import("../views/mall/Cart.vue"),
      meta: { title: "购物袋" },
    },
    {
      path: "/orders",
      component: () => import("../views/mall/Orders.vue"),
      meta: { title: "订单" },
    },
    {
      path: "/management",
      component: () => import("../views/product/Management.vue"),
      meta: { title: "商品管理" },
    },
    {
      path: "/ad",
      component: () => import("../views/product/Ad.vue"),
      meta: { title: "广告管理" },
    },
    {
      path: "/booklist",
      component: () => import("../views/mall/BookList.vue"),
      meta: { title: "书库" },
    },
    {
      path: "/reader",
      component: () => import("../views/mall/Reader.vue"),
      meta: { title: "在线阅读" },
    },
    {
      path: "/404",
      name: "404",
      component: () => import("../views/NotFound.vue"),
      meta: { title: "404" },
    },
    {
      path: "/:catchAll(.*)",
      redirect: "/404",
    },
  ],
});

const protectedRoutes = ["/cart", "/orders", "/dashboard"];
const adminOnlyRoutes = ["/management", "/ad"];

router.beforeEach((to, _, next) => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const isAuthenticated = !!token;

  const requiresAuth = protectedRoutes.some((path) => to.path.startsWith(path));
  const requiresAdmin = adminOnlyRoutes.some((path) =>
    to.path.startsWith(path)
  );

  if (requiresAdmin && role !== "admin") {
    next({
      path: "/404", // 修改为重定向到登录页
      query: { redirect: to.fullPath },
    });
    return;
  }

  if (requiresAuth && !isAuthenticated) {
    next({
      path: "/login", // 修改为重定向到登录页
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 其他情况正常访问（游客可访问的页面）
  next();
});

export { router };
