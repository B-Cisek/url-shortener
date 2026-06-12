<script setup lang="ts">
import { useToast } from '@nuxt/ui/composables'
import { isAxiosError } from 'axios'
import { ref } from 'vue'
import HomeFeatures from '../components/HomeFeatures.vue'
import ShortenedUrlResult from '../components/ShortenedUrlResult.vue'
import UrlInput from '../components/UrlInput.vue'
import { apiClient } from '../lib/api-client'

interface CreateUrlResponse {
  longUrl: string
  shortUrl: string
}

interface ApiErrorResponse {
  error?: string
  issues?: Array<{
    message?: string
  }>
}

defineOptions({
  name: 'HomeView',
})

const toast = useToast()
const url = ref('')
const error = ref('')
const shortenedUrl = ref('')
const isLoading = ref(false)

async function shortenUrl() {
  if (isLoading.value) {
    return
  }

  error.value = ''
  shortenedUrl.value = ''

  const inputUrl = url.value.trim()

  if (!inputUrl) {
    error.value = 'Wklej adres, który chcesz skrócić.'
    return
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(inputUrl)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol')
    }
  } catch {
    error.value =
      'Podaj poprawny adres zaczynający się od http:// lub https://.'
    return
  }

  isLoading.value = true

  try {
    const { data } = await apiClient.post<CreateUrlResponse>('/create-url', {
      url: parsedUrl.href,
    })

    shortenedUrl.value = data.shortUrl
  } catch (requestError) {
    if (isAxiosError<ApiErrorResponse>(requestError)) {
      error.value =
        requestError.response?.data.issues?.[0]?.message ??
        (requestError.response
          ? 'Nie udało się skrócić adresu. Spróbuj ponownie.'
          : 'Nie można połączyć się z serwerem. Spróbuj ponownie później.')
      return
    }

    error.value = 'Nie udało się skrócić adresu. Spróbuj ponownie.'
  } finally {
    isLoading.value = false
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
        Wklej dowolny adres URL i otrzymaj prosty link, który łatwo udostępnisz
        wszędzie.
      </p>

      <UrlInput
        v-model="url"
        :error="error"
        :loading="isLoading"
        @input="error = ''"
        @submit="shortenUrl"
      />
      <ShortenedUrlResult :url="shortenedUrl" @copy="copyShortenedUrl" />
      <HomeFeatures />
    </div>
  </UContainer>
</template>
