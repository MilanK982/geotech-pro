// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import GeotechnicalModel from '../components/geotechnical/GeotechnicalModel.vue';
import Login from '../components/auth/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/geotechnical/:modelId',
    name: 'GeotechnicalModel',
    component: GeotechnicalModel,
    props: true,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;