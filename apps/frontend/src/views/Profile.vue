<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useToast } from '@nuxt/ui/composables'
import { isAxiosError } from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '../lib/api-client'

interface UserUrlResponse {
  id: string
  longUrl: string
  shortUrl: string
  clickCount: number
  createdAt: string
  expiresAt: string | null
}

interface ShortenedLink extends UserUrlResponse {
  name: string
  clicks: number
  formattedCreatedAt: string
  status: 'Aktywny' | 'Wygasł'
}

defineOptions({
  name: 'ProfileView',
})

const toast = useToast()
const router = useRouter()
const search = ref('')
const links = ref<ShortenedLink[]>([])
const isLoading = ref(true)
const loadError = ref('')

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const columns: TableColumn<ShortenedLink>[] = [
  {
    accessorKey: 'name',
    header: 'Link',
  },
  {
    accessorKey: 'shortUrl',
    header: 'Skrócony adres',
  },
  {
    accessorKey: 'clicks',
    header: 'Kliknięcia',
  },
  {
    accessorKey: 'formattedCreatedAt',
    header: 'Utworzono',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'actions',
  },
]

const filteredLinks = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return links.value
  }

  return links.value.filter((link) =>
    [link.name, link.longUrl, link.shortUrl].some((value) =>
      value.toLowerCase().includes(query),
    ),
  )
})

const totalClicks = computed(() =>
  links.value.reduce((total, link) => total + link.clicks, 0),
)

const activeLinks = computed(
  () => links.value.filter((link) => link.status === 'Aktywny').length,
)

const mapUrl = (url: UserUrlResponse): ShortenedLink => {
  let name = url.longUrl

  try {
    name = new URL(url.longUrl).hostname
  } catch {
    // Keep the original URL as a readable fallback.
  }

  return {
    ...url,
    name,
    clicks: url.clickCount,
    formattedCreatedAt: dateFormatter.format(new Date(url.createdAt)),
    status:
      url.expiresAt && new Date(url.expiresAt).getTime() <= Date.now()
        ? 'Wygasł'
        : 'Aktywny',
  }
}

async function loadLinks() {
  isLoading.value = true
  loadError.value = ''

  try {
    const { data } = await apiClient.get<UserUrlResponse[]>('/api/urls')
    links.value = data.map(mapUrl)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      await router.push('/login')
      return
    }

    loadError.value = 'Nie udało się pobrać linków. Spróbuj ponownie.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLinks)

async function copyLink(shortUrl: string) {
  try {
    await navigator.clipboard.writeText(shortUrl)
    toast.add({
      title: 'Link skopiowany',
      description: shortUrl,
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
  <UContainer class="py-10 sm:py-14">
    <div
      class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <UBadge
          label="Panel użytkownika"
          icon="i-lucide-layout-dashboard"
          color="primary"
          variant="subtle"
          class="mb-3"
        />
        <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
          Twoje skrócone linki
        </h1>
        <p class="mt-2 max-w-2xl text-muted">
          Przeglądaj utworzone adresy i sprawdzaj ich podstawowe statystyki.
        </p>
      </div>

      <UButton
        label="Skróć nowy link"
        icon="i-lucide-plus"
        size="lg"
        to="/"
        class="justify-center"
      />
    </div>

    <div class="mb-8 grid gap-4 sm:grid-cols-3">
      <UCard variant="subtle">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-muted">Wszystkie linki</p>
            <p class="mt-1 text-2xl font-semibold text-highlighted">
              {{ links.length }}
            </p>
          </div>
          <div
            class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-link-2" class="size-5" />
          </div>
        </div>
      </UCard>

      <UCard variant="subtle">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-muted">Łączne kliknięcia</p>
            <p class="mt-1 text-2xl font-semibold text-highlighted">
              {{ totalClicks }}
            </p>
          </div>
          <div
            class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-mouse-pointer-click" class="size-5" />
          </div>
        </div>
      </UCard>

      <UCard variant="subtle">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-muted">Aktywne linki</p>
            <p class="mt-1 text-2xl font-semibold text-highlighted">
              {{ activeLinks }}
            </p>
          </div>
          <div
            class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-circle-check" class="size-5" />
          </div>
        </div>
      </UCard>
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="font-semibold text-highlighted">Ostatnie linki</h2>
            <p class="mt-1 text-sm text-muted">
              Linki utworzone na Twoim koncie.
            </p>
          </div>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Szukaj linku..."
            class="w-full sm:max-w-xs"
          />
        </div>
      </template>

      <UTable
        :data="filteredLinks"
        :columns="columns"
        :loading="isLoading"
        empty="Nie znaleziono pasujących linków."
      >
        <template #name-cell="{ row }">
          <div class="max-w-64">
            <p class="font-medium text-highlighted">
              {{ row.original.name }}
            </p>
            <p class="truncate text-xs text-dimmed">
              {{ row.original.longUrl }}
            </p>
          </div>
        </template>

        <template #shortUrl-cell="{ row }">
          <a
            :href="row.original.shortUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-primary hover:underline"
          >
            {{ row.original.shortUrl }}
          </a>
        </template>

        <template #clicks-cell="{ row }">
          <span class="font-medium text-highlighted">
            {{ row.original.clicks }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :label="row.original.status"
            :color="row.original.status === 'Aktywny' ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              icon="i-lucide-copy"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Kopiuj skrócony link"
              @click="copyLink(row.original.shortUrl)"
            />
            <UButton
              icon="i-lucide-external-link"
              color="neutral"
              variant="ghost"
              size="sm"
              :href="row.original.shortUrl"
              target="_blank"
              aria-label="Otwórz skrócony link"
            />
          </div>
        </template>
      </UTable>

      <template #footer>
        <UAlert
          v-if="loadError"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Nie udało się pobrać linków"
          :description="loadError"
          :actions="[
            {
              label: 'Spróbuj ponownie',
              color: 'error',
              variant: 'soft',
              onClick: loadLinks,
            },
          ]"
        />
        <div
          v-else-if="!isLoading && links.length === 0"
          class="py-4 text-center text-sm text-muted"
        >
          Nie masz jeszcze żadnych skróconych linków.
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
