import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { applySeo, type SeoMeta } from '@/lib/seo'

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
      { path: 'campaigns', name: 'admin-campaigns', component: () => import('@/pages/admin/CampaignsPage.vue'), meta: { title: 'Campañas' } },
      { path: 'mensajes', name: 'admin-mensajes', component: () => import('@/pages/admin/MensajesPage.vue'), meta: { title: 'Mensajes' } },
      { path: 'contactos', name: 'admin-contactos', component: () => import('@/pages/admin/ContactosPage.vue'), meta: { title: 'Contactos CRM' } },
      { path: 'reservas-config', name: 'admin-reservas-config', component: () => import('@/pages/admin/ReservaConfigPage.vue'), meta: { title: 'Config. Reservas' } }
    ]
  },
  // ── PÚBLICO ───────────────────────────────────────────────────
  {
    path: '/', name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: {
      title: 'Mi Pueblo Cotati · Auténtica comida mexicana desde 1997',
      seo: { description: 'Auténtica comida mexicana en Sonoma County desde 1997. Más de 170 platillos, 6 sucursales, catering y food truck.', image: '/og-image.jpg' }
    }
  },
  {
    path: '/menu', name: 'menu',
    component: () => import('@/pages/MenuPage.vue'),
    meta: {
      title: 'Menú · Mi Pueblo Cotati',
      seo: { description: 'Explora nuestro menú de más de 170 platillos auténticos mexicanos: tacos, burritos, fajitas, mariscos y mucho más.', image: '/assets/hero/hero-menu.jpg' }
    }
  },
  { path: '/menu/:slug', name: 'menu-item', component: () => import('@/pages/MenuItemPage.vue') },
  {
    path: '/sucursales', name: 'locations',
    component: () => import('@/pages/LocationsPage.vue'),
    meta: {
      title: 'Sucursales · Mi Pueblo Cotati',
      seo: { description: 'Encuentra nuestra sucursal más cercana en Cotati, Petaluma, Rohnert Park y más ciudades del condado de Sonoma.' }
    }
  },
  { path: '/sucursales/:slug', name: 'location-detail', component: () => import('@/pages/LocationDetailPage.vue') },
  {
    path: '/reservar', name: 'reserve',
    component: () => import('@/pages/ReservePage.vue'),
    meta: {
      title: 'Reservar mesa · Mi Pueblo Cotati',
      seo: { description: 'Reserva tu mesa en Mi Pueblo Cotati en menos de 30 segundos. Sin espera, sin complicaciones.' }
    }
  },
  {
    path: '/promociones', name: 'promotions',
    component: () => import('@/pages/PromotionsPage.vue'),
    meta: {
      title: 'Promociones · Mi Pueblo Cotati',
      seo: { description: 'Aprovecha nuestras promociones: Taco Tuesday, Burrito Thursday, descuentos para suscriptores y más.' }
    }
  },
  {
    path: '/catering', name: 'catering',
    component: () => import('@/pages/CateringPage.vue'),
    meta: {
      title: 'Catering · Mi Pueblo Cotati',
      seo: { description: 'Servicio de catering para bodas, eventos corporativos y fiestas. Cocina auténtica mexicana para grupos grandes.' }
    }
  },
  {
    path: '/food-truck', name: 'food-truck',
    component: () => import('@/pages/FoodTruckPage.vue'),
    meta: {
      title: 'Food Truck · Mi Pueblo Cotati',
      seo: { description: 'Nuestro food truck lleva la auténtica comida mexicana directo a tu evento. Disponible en Sonoma County.' }
    }
  },
  {
    path: '/resenas', name: 'reviews',
    component: () => import('@/pages/ReviewsPage.vue'),
    meta: {
      title: 'Reseñas · Mi Pueblo Cotati',
      seo: { description: 'Lo que dicen nuestros clientes. Reseñas reales de personas que han disfrutado nuestra comida.' }
    }
  },
  { path: '/encuesta', name: 'survey', component: () => import('@/pages/SurveyPage.vue'), meta: { title: 'Encuesta · Mi Pueblo Cotati' } },
  {
    path: '/contacto', name: 'contact',
    component: () => import('@/pages/ContactPage.vue'),
    meta: {
      title: 'Contacto · Mi Pueblo Cotati',
      seo: { description: 'Contáctanos por teléfono, correo o redes sociales. También puedes visitarnos en cualquiera de nuestras sucursales.' }
    }
  },
  {
    path: '/blog', name: 'blog',
    component: () => import('@/pages/BlogPage.vue'),
    meta: {
      title: 'Blog · Mi Pueblo Cotati',
      seo: { description: 'Recetas, historias y novedades de Mi Pueblo Cotati. Cultura mexicana y gastronomía desde Sonoma County.' }
    }
  },
  { path: '/blog/:slug', name: 'blog-post', component: () => import('@/pages/BlogPostPage.vue') },
  { path: '/legal/privacidad', name: 'privacy', component: () => import('@/pages/legal/PrivacyPage.vue'), meta: { title: 'Privacidad · Mi Pueblo Cotati' } },
  { path: '/legal/terminos', name: 'terms', component: () => import('@/pages/legal/TermsPage.vue'), meta: { title: 'Términos · Mi Pueblo Cotati' } },
  { path: '/legal/cookies', name: 'cookies', component: () => import('@/pages/legal/CookiesPage.vue'), meta: { title: 'Cookies · Mi Pueblo Cotati' } },
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
  const title = (to.meta?.title as string) || 'Mi Pueblo Cotati'
  const routeSeo = (to.meta?.seo as SeoMeta | undefined) ?? {}
  const url = `https://mipueblocotati.easypage.mx${to.path}`
  applySeo({ title, url, ...routeSeo })
})

export default router
