import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalizedGeneric,
} from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'
import Signup from './views/Signup.vue'
import { authClient } from './lib/auth-client'
import AuthLayout from './layouts/AuthLayout.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { auth: false },
    },
    {
      component: AuthLayout,
      path: '/',
      children: [
        {
          path: 'login',
          name: 'login',
          component: Login,
          meta: { auth: false },
        },
        {
          path: 'signup',
          name: 'signup',
          component: Signup,
          meta: { auth: false },
        },
      ],
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { auth: true },
    },
  ],
})

router.beforeEach(async (to: RouteLocationNormalizedGeneric) => {
  const { data: session } = await authClient.getSession()
  const auth = ['login', 'register']

  if (auth.includes(String(to.name ?? '')) && session) {
    return {
      path: '/',
    }
  }

  if (!to.meta.auth) return

  if (!session) {
    return {
      path: '/login',
    }
  }
})
