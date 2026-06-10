import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Profile from './views/Profile.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
  ],
})
