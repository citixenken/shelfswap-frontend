import { createRouter, createWebHistory } from 'vue-router'
import AddBookView from '../views/AddBookView.vue'
import BookListView from '../views/BookListView.vue'
import BookDetailsView from '../views/BookDetailsView.vue'
import EditBookView from '../views/EditBookView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { useAuth } from '@clerk/vue'

import LandingView from '../views/LandingView.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingView
  },
  {
    path: '/books',
    name: 'BookList',
    component: BookListView
  },
  {
    path: '/add',
    name: 'AddBook',
    component: AddBookView,
    meta: { requiresAuth: true }
  },
  {
    path: '/books/:id',
    name: 'BookDetails',
    component: BookDetailsView
  },
  {
    path: '/books/:id/edit',
    name: 'EditBook',
    component: EditBookView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPasswordView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/MembersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: () => import('../views/WishlistView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/genres',
    name: 'Genres',
    component: () => import('../views/GenresView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../views/CommunityView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/books/top',
    name: 'TopBooks',
    component: () => import('../views/TopBooksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/genres/popular',
    name: 'PopularGenres',
    component: () => import('../views/PopularGenresView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/TermsView.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/PrivacyView.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/ContactView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    const { isSignedIn } = useAuth()

    if (!isSignedIn.value) {
      // Redirect to login page
      next('/login')
      return
    }
  }

  next()
})

export default router
