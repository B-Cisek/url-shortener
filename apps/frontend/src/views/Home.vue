<script setup lang="ts">
import { useToast } from '@nuxt/ui/composables'
import { ref } from 'vue'

defineOptions({
  name: 'HomeView',
})

const toast = useToast()
const url = ref('')
const error = ref('')
const shortenedUrl = ref('')

function shortenUrl() {
  error.value = ''
  shortenedUrl.value = ''

  if (!url.value.trim()) {
    error.value = 'Wklej adres, który chcesz skrócić.'
    return
  }

  try {
    const parsedUrl = new URL(url.value)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol')
    }

    shortenedUrl.value = 'https://shortly.dev/demo'
  } catch {
    error.value =
      'Podaj poprawny adres zaczynający się od http:// lub https://.'
  }
}

async function copyShortenedUrl() {
  try {
    await navigator.clipboard.writeText(shortenedUrl.value)
    toast.add({
      title: 'Link skopiowany',
      description: 'Skrócony adres jest gotowy do udostępnienia.',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch {
    toast.add({
      title: 'Nie udało się skopiować linku',
      description: 'Skopiuj adres ręcznie.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-default text-default">
    <div
      class="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
    />
    <div
      class="pointer-events-none absolute right-0 top-1/3 size-72 translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
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

        <div class="flex items-center gap-2">
          <UButton
            label="Zaloguj się"
            color="neutral"
            variant="ghost"
            to="/login"
          />
          <UButton
            label="Załóż konto"
            color="neutral"
            variant="outline"
            to="/register"
          />
        </div>
      </UContainer>
    </header>

    <main class="relative">
      <UContainer
        class="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center py-16"
      >
        <div class="mx-auto w-full max-w-3xl text-center">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-muted bg-elevated px-3 py-1.5 text-sm text-toned shadow-sm"
          >
            <UIcon name="i-lucide-sparkles" class="size-4 text-primary" />
            Krótsze linki, łatwiejsze udostępnianie
          </div>

          <h1
            class="text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl lg:text-6xl"
          >
            Zamień długi adres w
            <span class="text-primary">krótki link</span>
          </h1>
          <p
            class="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg"
          >
            Wklej dowolny adres URL i otrzymaj prosty link, który łatwo
            udostępnisz wszędzie.
          </p>

          <UCard
            variant="subtle"
            class="mx-auto mt-10 max-w-2xl text-left shadow-xl shadow-primary/5"
            :ui="{ body: 'p-4 sm:p-6' }"
          >
            <form
              class="flex flex-col gap-3 sm:flex-row sm:items-start"
              @submit.prevent="shortenUrl"
            >
              <UFormField class="min-w-0 flex-1">
                <UInput
                  v-model="url"
                  type="url"
                  color="neutral"
                  :highlight="false"
                  :aria-invalid="Boolean(error)"
                  placeholder="https://przyklad.pl/bardzo-dlugi-link"
                  icon="i-lucide-link"
                  size="xl"
                  autocomplete="url"
                  class="w-full"
                  @input="error = ''"
                />
                <p v-if="error" class="mt-2 text-sm text-error">
                  {{ error }}
                </p>
              </UFormField>
              <UButton
                type="submit"
                label="Skróć link"
                trailing-icon="i-lucide-arrow-right"
                size="xl"
                class="justify-center"
              />
            </form>
            <p class="mt-3 flex items-center gap-1.5 text-xs text-dimmed">
              <UIcon name="i-lucide-shield-check" class="size-3.5" />
              Bez rejestracji. Wklej link i gotowe.
            </p>
          </UCard>

          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
          >
            <UCard
              v-if="shortenedUrl"
              variant="outline"
              class="mx-auto mt-5 max-w-2xl text-left"
              :ui="{ body: 'p-4 sm:p-5' }"
            >
              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="mb-1 flex items-center gap-1.5 text-sm text-muted">
                    <UIcon
                      name="i-lucide-circle-check"
                      class="size-4 text-success"
                    />
                    Twój skrócony link
                  </p>
                  <a
                    :href="shortenedUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block truncate text-lg font-semibold text-primary hover:underline"
                  >
                    {{ shortenedUrl }}
                  </a>
                </div>
                <UButton
                  label="Kopiuj"
                  icon="i-lucide-copy"
                  color="neutral"
                  variant="outline"
                  size="lg"
                  class="justify-center"
                  @click="copyShortenedUrl"
                />
              </div>
            </UCard>
          </Transition>

          <div
            class="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="size-4 text-primary" />
              Szybko i prosto
            </span>
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-lock-keyhole" class="size-4 text-primary" />
              Bezpieczne linki
            </span>
            <span class="flex items-center gap-2">
              <UIcon
                name="i-lucide-monitor-smartphone"
                class="size-4 text-primary"
              />
              Na każdym urządzeniu
            </span>
          </div>
        </div>
      </UContainer>
    </main>
  </div>
</template>
