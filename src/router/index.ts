import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    { path:'/ai', component:()=>import('../views/AI.vue'), meta:{title:'AI 选书'} },
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      component: () => import('../views/user/Login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      component: () => import('../views/user/Register.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/home',
      component: () => import('../views/Home.vue'),
      meta: { title: '枕石书屋' },
    },
    {
      path: '/dashboard',
      component: () => import('../views/user/Dashboard.vue'),
      meta: { title: '个人信息' },
    },
    {
      path: '/cart',
      component: () => import('../views/mall/Cart.vue'),
      meta: { title: '购物袋' },
    },
    {
      path: '/orders',
      component: () => import('../views/mall/Orders.vue'),
      meta: { title: '订单' },
    },
    {
      path: '/manage/products',
      component: () => import('../views/admin/ProductManage.vue'),
      meta: { title: '商品管理' },
    },
    {
      path: '/manage/ads',
      component: () => import('../views/admin/AdManage.vue'),
      meta: { title: '广告管理' },
    },
    {
      path: '/booklist',
      component: () => import('../views/mall/BookList.vue'),
      meta: { title: '书库' },
    },
    {
      path: '/reader',
      component: () => import('../views/mall/Reader.vue'),
      meta: { title: '在线阅读' },
    },
    {
      path: '/messages',
      name: 'Messages',
      component: () => import('../views/user/MessageList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/messages/conversation/:userId',
      name: 'Conversation',
      component: () => import('../views/user/Conversation.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/NotFound.vue'),
      meta: { title: '404' },
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/404',
    },
    {
      path: '/bookdetail/:id',
      name: 'BookDetail',
      component: () => import('../views/mall/BookDetail.vue'),
      meta: { title: '书籍详情' },
    },
    {
      path: '/about/aboutus',
      name: 'AboutUs',
      component: () => import('../views/about/AboutUs.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/about/join-us',
      name: 'JoinUs',
      component: () => import('../views/about/JoinUs.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/about/contact',
      name: 'ContactUs',
      component: () => import('../views/about/ContactUs.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/about/help',
      name: 'HelpCenter',
      component: () => import('../views/about/HelpCenter.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/manage/coupons',
      name: 'CouponManagement',
      component: () => import('../views/admin/CouponManage.vue'),
      meta: { requiresAuth: false },
    },
  ],
});

const protectedRoutes = ['/cart', '/orders', '/dashboard', '/reader', '/messages'];
const adminOnlyRoutes = ['/manage'];

router.beforeEach((to, _, next) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const isAuthenticated = !!token;

  const requiresAuth = protectedRoutes.some((path) => to.path.startsWith(path));
  const requiresAdmin = adminOnlyRoutes.some((path) => to.path.startsWith(path));

  if (requiresAdmin && role !== 'admin') {
    next({
      path: '/404', // 修改为重定向到登录页
      query: { redirect: to.fullPath },
    });
    return;
  }

  if (requiresAuth && !isAuthenticated) {
    next({
      path: '/login', // 修改为重定向到登录页
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 其他情况正常访问（游客可访问的页面）
  next();
});

export { router };
