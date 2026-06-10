<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '../lib/auth-client'

defineOptions({
  name: 'AppHeader',
})

const router = useRouter()
const sessionState = authClient.useSession()
const session = computed(() => sessionState.value.data)
const isPending = computed(() => sessionState.value.isPending)
const isSigningOut = ref(false)

async function logout() {
  isSigningOut.value = true

  try {
    await authClient.signOut()
    await router.push('/')
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <header class="relative border-b border-muted">
    <UContainer class="flex h-18 items-center justify-between">
      <RouterLink
        to="/"
        class="flex items-center gap-2.5 font-semibold text-highlighted"
      >
        <span
          class="flex size-9 items-center justify-center rounded-xl bg-primary text-inverted"
        >
          <UIcon name="i-lucide-link-2" class="size-5" />
        </span>
        <span class="text-lg">Shortly</span>
      </RouterLink>

      <div class="flex items-center gap-2">
        <UButton
          v-if="!session && !isPending"
          label="Zaloguj się"
          color="neutral"
          variant="ghost"
          to="/login"
        />
        <UButton
          v-if="!session && !isPending"
          label="Załóż konto"
          color="neutral"
          variant="outline"
          to="/signup"
        />
        <UButton
          v-if="session"
          label="Profil"
          color="neutral"
          variant="ghost"
          to="/profile"
        />
        <UButton
          v-if="session"
          label="Wyloguj się"
          icon="i-lucide-log-out"
          color="neutral"
          variant="outline"
          :loading="isSigningOut"
          @click="logout"
        />
      </div>
    </UContainer>
  </header>
</template>
