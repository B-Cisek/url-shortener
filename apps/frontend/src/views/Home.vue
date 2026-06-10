<script setup lang="ts">
import { useToast } from '@nuxt/ui/composables'
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import HomeFeatures from '../components/HomeFeatures.vue'
import ShortenedUrlResult from '../components/ShortenedUrlResult.vue'
import UrlInput from '../components/UrlInput.vue'

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

    <AppHeader />

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

          <UrlInput
            v-model="url"
            :error="error"
            @input="error = ''"
            @submit="shortenUrl"
          />
          <ShortenedUrlResult :url="shortenedUrl" @copy="copyShortenedUrl" />
          <HomeFeatures />
        </div>
      </UContainer>
    </main>
  </div>
</template>
