import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  // ── ADMIN ─────────────────────────────────────────────────────
  { path: '/admin/login', name: 'admin-login', component: () => import('@/pages/admin/LoginPage.vue'), meta: { layout: 'blank', title: 'Admin · Mi Pueblo' } },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { layout: 'admin', requiresAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/pages/admin/DashboardPage.vue'), meta: { title: 'Dashboard' } },
      { path: 'menu/items', name: 'admin-menu-items', component: () => import('@/pages/admin/MenuItemsPage.vue'), meta: { title: 'Platillos' } },
      { path: 'menu/categories', name: 'admin-menu-cats', component: () => import('@/pages/admin/MenuCategoriesPage.vue'), meta: { title: 'Categorías' } },
      { path: 'promotions', name: 'admin-promos', component: () => import('@/pages/admin/PromotionsPage.vue'), meta: { title: 'Promociones' } },
      { path: 'reservations', name: 'admin-reservations', component: () => import('@/pages/admin/ReservationsPage.vue'), meta: { title: 'Reservas' } },
      { path: 'catering', name: 'admin-catering', component: () => import('@/pages/admin/CateringPage.vue'), meta: { title: 'Catering' } },
      { path: 'reviews', name: 'admin-reviews', component: () => import('@/pages/admin/ReviewsPage.vue'), meta: { title: 'Reseñas' } },
      { path: 'gallery', name: 'admin-gallery', component: () => import('@/pages/admin/GalleryPage.vue'), meta: { title: 'Galería' } },
      { path: 'locations', name: 'admin-locations', component: () => import('@/pages/admin/LocationsPage.vue'), meta: { title: 'Sucursales' } },
      { path: 'newsletter', name: 'admin-newsletter', component: () => import('@/pages/admin/NewsletterPage.vue'), meta: { title: 'Newsletter' } },
      { path: 'blog', name: 'admin-blog', component: () => import('@/pages/admin/BlogPage.vue'), meta: { title: 'Blog' } },
      { path: 'campaigns', name: 'admin-campaigns', component: () => import('@/pages/admin/CampaignsPage.vue'), meta: { title: 'Campañas' } }
    ]
  },
  // ── PÚBLICO ───────────────────────────────────────────────────
  { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue'), meta: { title: 'Mi Pueblo Cotati · Auténtica comida mexicana' } },
  { path: '/menu', name: 'menu', component: () => import('@/pages/MenuPage.vue'), meta: { title: 'Menú · Mi Pueblo Cotati' } },
  { path: '/menu/:slug', name: 'menu-item', component: () => import('@/pages/MenuItemPage.vue') },
  { path: '/sucursales', name: 'locations', component: () => import('@/pages/LocationsPage.vue'), meta: { title: 'Sucursales · Mi Pueblo' } },
  { path: '/sucursales/:slug', name: 'location-detail', component: () => import('@/pages/LocationDetailPage.vue') },
  { path: '/reservar', name: 'reserve', component: () => import('@/pages/ReservePage.vue'), meta: { title: 'Reservar mesa · Mi Pueblo Cotati' } },
  { path: '/promociones', name: 'promotions', component: () => import('@/pages/PromotionsPage.vue'), meta: { title: 'Promociones · Mi Pueblo' } },
  { path: '/catering', name: 'catering', component: () => import('@/pages/CateringPage.vue') },
  { path: '/food-truck', name: 'food-truck', component: () => import('@/pages/FoodTruckPage.vue') },
  { path: '/resenas', name: 'reviews', component: () => import('@/pages/ReviewsPage.vue') },
  { path: '/encuesta', name: 'survey', component: () => import('@/pages/SurveyPage.vue') },
  { path: '/contacto', name: 'contact', component: () => import('@/pages/ContactPage.vue') },
  { path: '/blog', name: 'blog', component: () => import('@/pages/BlogPage.vue'), meta: { title: 'Blog · Mi Pueblo Cotati' } },
  { path: '/blog/:slug', name: 'blog-post', component: () => import('@/pages/BlogPostPage.vue') },
  { path: '/legal/privacidad', name: 'privacy', component: () => import('@/pages/legal/PrivacyPage.vue') },
  { path: '/legal/terminos', name: 'terms', component: () => import('@/pages/legal/TermsPage.vue') },
  { path: '/legal/cookies', name: 'cookies', component: () => import('@/pages/legal/CookiesPage.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPos) {
    if (savedPos) return savedPos
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  if (to.meta?.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.token) return { name: 'admin-login' }
    if (!auth.user) {
      const me = await auth.fetchMe()
      if (!me) return { name: 'admin-login' }
    }
  }
  return true
})

router.afterEach((to) => {
  const t = (to.meta?.title as string) || 'Mi Pueblo Cotati'
  document.title = t
})

export default router
