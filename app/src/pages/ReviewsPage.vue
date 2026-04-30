<template>
  <main class="container-page py-16">
    <h1 class="font-display text-4xl md:text-5xl font-bold text-secondary-dark text-center">Reseñas</h1>
    <p class="text-ink-muted text-center mt-2">Lo que opinan nuestros clientes</p>
    <div class="grid md:grid-cols-3 gap-6 mt-10">
      <article v-for="i in 6" :key="i" class="card p-6">
        <p class="text-yellow-500">★★★★★</p>
        <p class="text-ink-muted mt-3 italic">"Las mejores fajitas y el mejor servicio del condado. Volveré pronto."</p>
        <p class="text-sm font-semibold text-secondary mt-4">— Cliente verificado</p>
      </article>
    </div>
  </main>
</template>
