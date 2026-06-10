<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '../lib/auth-client'

defineOptions({
  name: 'RegisterView',
})

const router = useRouter()
const loading = ref(false)
const serverError = ref('')
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

function validate() {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.name.trim()) {
    errors.name = 'Podaj swoje imię.'
  }

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
      name: form.name.trim(),
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
  <div class="relative min-h-screen overflow-hidden bg-default text-default">
    <div
      class="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
    />

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

        <UButton
          label="Zaloguj się"
          color="neutral"
          variant="ghost"
          to="/login"
        />
      </UContainer>
    </header>

    <main class="relative">
      <UContainer
        class="flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-12"
      >
        <UCard
          variant="subtle"
          class="w-full max-w-md shadow-xl shadow-primary/5"
          :ui="{ body: 'p-6 sm:p-8' }"
        >
          <div class="mb-7 text-center">
            <div
              class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <UIcon name="i-lucide-user-plus" class="size-6" />
            </div>
            <h1 class="text-2xl font-semibold text-highlighted">
              Utwórz konto
            </h1>
            <p class="mt-2 text-sm text-muted">
              Zapisuj linki i zarządzaj nimi w jednym miejscu.
            </p>
          </div>

          <UAlert
            v-if="serverError"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :description="serverError"
            class="mb-5"
          />

          <form class="space-y-4" @submit.prevent="register">
            <UFormField label="Imię" required>
              <UInput
                v-model="form.name"
                color="neutral"
                :highlight="false"
                :aria-invalid="Boolean(errors.name)"
                placeholder="Jan Kowalski"
                icon="i-lucide-user"
                autocomplete="name"
                size="xl"
                class="w-full"
                @input="errors.name = ''"
              />
              <p v-if="errors.name" class="mt-2 text-sm text-error">
                {{ errors.name }}
              </p>
            </UFormField>

            <UFormField label="E-mail" required>
              <UInput
                v-model="form.email"
                type="email"
                color="neutral"
                :highlight="false"
                :aria-invalid="Boolean(errors.email)"
                placeholder="ty@przyklad.pl"
                icon="i-lucide-mail"
                autocomplete="email"
                size="xl"
                class="w-full"
                @input="errors.email = ''"
              />
              <p v-if="errors.email" class="mt-2 text-sm text-error">
                {{ errors.email }}
              </p>
            </UFormField>

            <UFormField label="Hasło" required>
              <UInput
                v-model="form.password"
                type="password"
                color="neutral"
                :highlight="false"
                :aria-invalid="Boolean(errors.password)"
                placeholder="Minimum 8 znaków"
                icon="i-lucide-lock-keyhole"
                autocomplete="new-password"
                size="xl"
                class="w-full"
                @input="errors.password = ''"
              />
              <p v-if="errors.password" class="mt-2 text-sm text-error">
                {{ errors.password }}
              </p>
            </UFormField>

            <UFormField label="Powtórz hasło" required>
              <UInput
                v-model="form.confirmPassword"
                type="password"
                color="neutral"
                :highlight="false"
                :aria-invalid="Boolean(errors.confirmPassword)"
                placeholder="Powtórz swoje hasło"
                icon="i-lucide-lock-keyhole"
                autocomplete="new-password"
                size="xl"
                class="w-full"
                @input="errors.confirmPassword = ''"
              />
              <p v-if="errors.confirmPassword" class="mt-2 text-sm text-error">
                {{ errors.confirmPassword }}
              </p>
            </UFormField>

            <UButton
              type="submit"
              label="Załóż konto"
              trailing-icon="i-lucide-arrow-right"
              size="xl"
              block
              :loading="loading"
            />
          </form>

          <p class="mt-6 text-center text-sm text-muted">
            Masz już konto?
            <RouterLink
              to="/login"
              class="font-medium text-primary hover:underline"
            >
              Zaloguj się
            </RouterLink>
          </p>
        </UCard>
      </UContainer>
    </main>
  </div>
</template>
