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
  <UHeader title="Shortly" class="bg-transparent">
    <template #title>
      <span class="flex items-center gap-2.5 font-semibold">
        <span
          class="flex size-9 items-center justify-center rounded-xl bg-primary text-inverted"
        >
          <UIcon name="i-lucide-link-2" class="size-5" />
        </span>
        <span class="text-lg">Url Shortener</span>
      </span>
    </template>

    <template #right>
      <div class="hidden items-center gap-2 lg:flex">
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
    </template>

    <template #body>
      <div class="flex flex-col gap-2">
        <UButton
          v-if="!session && !isPending"
          label="Zaloguj się"
          color="neutral"
          variant="ghost"
          to="/login"
          block
        />
        <UButton
          v-if="!session && !isPending"
          label="Załóż konto"
          color="neutral"
          variant="outline"
          to="/signup"
          block
        />
        <UButton
          v-if="session"
          label="Profil"
          color="neutral"
          variant="ghost"
          to="/profile"
          block
        />
        <UButton
          v-if="session"
          label="Wyloguj się"
          icon="i-lucide-log-out"
          color="neutral"
          variant="outline"
          :loading="isSigningOut"
          block
          @click="logout"
        />
      </div>
    </template>
  </UHeader>
</template>
