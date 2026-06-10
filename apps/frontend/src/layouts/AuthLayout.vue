<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-default text-default">
    <div
      class="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
    />
    <AppHeader />
    <main class="relative">
      <RouterView />
    </main>
  </div>
</template>
