<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '../components/AuthCard.vue'
import AuthInput from '../components/AuthInput.vue'
import { authClient } from '../lib/auth-client'

defineOptions({
  name: 'SignupView',
})

const router = useRouter()
const loading = ref(false)
const serverError = ref('')
const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

function validate() {
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.email.trim()) {
    errors.email = 'Podaj adres e-mail.'
  } else if (!form.email.includes('@')) {
    errors.email = 'Podaj poprawny adres e-mail.'
  }

  if (!form.password) {
    errors.password = 'Podaj hasło.'
  } else if (form.password.length < 8) {
    errors.password = 'Hasło musi mieć co najmniej 8 znaków.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Powtórz hasło.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Hasła nie są takie same.'
  }

  return !Object.values(errors).some(Boolean)
}

async function register() {
  serverError.value = ''

  if (!validate()) {
    return
  }

  loading.value = true

  try {
    const { error } = await authClient.signUp.email({
      name: form.email.trim().split('@')[0],
      email: form.email.trim(),
      password: form.password,
    })

    if (error) {
      serverError.value =
        error.status === 422
          ? 'Konto z tym adresem e-mail już istnieje.'
          : 'Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.'
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
    icon="i-lucide-user-plus"
    title="Utwórz konto"
    description="Zapisuj linki i zarządzaj nimi w jednym miejscu."
    :server-error="serverError"
  >
    <form class="space-y-4" @submit.prevent="register">
      <AuthInput
        v-model="form.email"
        label="E-mail"
        type="email"
        :error="errors.email"
        placeholder="ty@przyklad.pl"
        icon="i-lucide-mail"
        autocomplete="email"
        @input="errors.email = ''"
      />
      <AuthInput
        v-model="form.password"
        label="Hasło"
        type="password"
        :error="errors.password"
        placeholder="Minimum 8 znaków"
        icon="i-lucide-lock-keyhole"
        autocomplete="new-password"
        @input="errors.password = ''"
      />
      <AuthInput
        v-model="form.confirmPassword"
        label="Powtórz hasło"
        type="password"
        :error="errors.confirmPassword"
        placeholder="Powtórz swoje hasło"
        icon="i-lucide-lock-keyhole"
        autocomplete="new-password"
        @input="errors.confirmPassword = ''"
      />
      <UButton
        type="submit"
        label="Załóż konto"
        trailing-icon="i-lucide-arrow-right"
        size="xl"
        block
        :loading="loading"
      />
    </form>

    <template #footer>
      <p class="mt-6 text-center text-sm text-muted">
        Masz już konto?
        <RouterLink
          to="/login"
          class="font-medium text-primary hover:underline"
        >
          Zaloguj się
        </RouterLink>
      </p>
    </template>
  </AuthCard>
</template>
