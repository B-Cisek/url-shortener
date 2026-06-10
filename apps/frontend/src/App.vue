<script setup lang="ts"></script>

<template>
  <UApp>
    <nav>
      <RouterLink to="/">Strona główna</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
    </nav>

    <RouterView />
  </UApp>
</template>
