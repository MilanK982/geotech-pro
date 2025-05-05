import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Project from '../views/Project.vue';
import GeotechnicalModel from '../views/GeotechnicalModel.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/project/:id', name: 'Project', component: Project },
  { path: '/geotechnical/:projectId', name: 'GeotechnicalModel', component: GeotechnicalModel },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;