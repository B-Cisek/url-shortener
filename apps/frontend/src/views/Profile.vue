<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'

defineOptions({
  name: 'ProfileView',
})
</script>

<template>
  <div class="min-h-screen bg-default text-default">
    <AppHeader />
    <main>
      <UContainer class="py-12">profile</UContainer>
    </main>
  </div>
</template>
