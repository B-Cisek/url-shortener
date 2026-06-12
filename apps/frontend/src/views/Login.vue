<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '../components/AuthCard.vue'
import AuthInput from '../components/AuthInput.vue'
import { authClient } from '../lib/auth-client'

defineOptions({
  name: 'LoginView',
})

const router = useRouter()
const loading = ref(false)
const serverError = ref('')
const errors = reactive({
  email: '',
  password: '',
})
const form = reactive({
  email: '',
  password: '',
})

function validate() {
  errors.email = ''
  errors.password = ''

  if (!form.email.trim()) {
    errors.email = 'Podaj adres e-mail.'
  } else if (!form.email.includes('@')) {
    errors.email = 'Podaj poprawny adres e-mail.'
  }

  if (!form.password) {
    errors.password = 'Podaj hasło.'
  }

  return !errors.email && !errors.password
}

async function login() {
  serverError.value = ''

  if (!validate()) {
    return
  }

  loading.value = true

  try {
    const { error } = await authClient.signIn.email({
      email: form.email.trim(),
      password: form.password,
    })

    if (error) {
      serverError.value = 'Nieprawidłowy e-mail lub hasło.'
      return
    }

    await router.push('/profile')
  } catch {
    serverError.value = 'Nie udało się połączyć z serwerem. Spróbuj ponownie.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    icon="i-lucide-log-in"
    title="Witaj ponownie"
    description="Zaloguj się, aby zarządzać swoimi linkami."
    :server-error="serverError"
  >
    <form class="space-y-5" @submit.prevent="login">
      <AuthInput
        v-model="form.email"
        label="E-mail"
        type="email"
        :error="errors.email"
        autocomplete="email"
        @input="errors.email = ''"
      />
      <AuthInput
        v-model="form.password"
        label="Hasło"
        type="password"
        :error="errors.password"
        autocomplete="current-password"
        @input="errors.password = ''"
      />
      <UButton
        type="submit"
        label="Zaloguj się"
        size="xl"
        block
        :loading="loading"
      />
    </form>

    <template #footer>
      <p class="mt-6 text-center text-sm text-muted">
        Nie masz jeszcze konta?
        <RouterLink
          to="/signup"
          class="font-medium text-primary hover:underline"
        >
          Zarejestruj się
        </RouterLink>
      </p>
    </template>
  </AuthCard>
</template>
