<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useToast } from '@nuxt/ui/composables'
import { computed, ref } from 'vue'

interface ShortenedLink {
  id: number
  name: string
  longUrl: string
  shortUrl: string
  clicks: number
  createdAt: string
  status: 'Aktywny' | 'Wygasł'
}

defineOptions({
  name: 'ProfileView',
})

const toast = useToast()
const search = ref('')

const links: ShortenedLink[] = [
  {
    id: 1,
    name: 'Portfolio',
    longUrl: 'https://example.com/portfolio/projects/url-shortener',
    shortUrl: 'https://shortly.dev/aB3xP9',
    clicks: 284,
    createdAt: '12 czerwca 2026',
    status: 'Aktywny',
  },
  {
    id: 2,
    name: 'Dokumentacja projektu',
    longUrl: 'https://docs.example.com/projects/url-shortener/getting-started',
    shortUrl: 'https://shortly.dev/kL8mQ2',
    clicks: 137,
    createdAt: '8 czerwca 2026',
    status: 'Aktywny',
  },
  {
    id: 3,
    name: 'Formularz opinii',
    longUrl: 'https://forms.example.com/customer-feedback/summer-campaign',
    shortUrl: 'https://shortly.dev/tR4vN7',
    clicks: 96,
    createdAt: '29 maja 2026',
    status: 'Aktywny',
  },
  {
    id: 4,
    name: 'Wiosenna kampania',
    longUrl: 'https://example.com/campaigns/spring-2026',
    shortUrl: 'https://shortly.dev/cD6fH1',
    clicks: 421,
    createdAt: '3 marca 2026',
    status: 'Wygasł',
  },
]

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
    accessorKey: 'createdAt',
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
    return links
  }

  return links.filter((link) =>
    [link.name, link.longUrl, link.shortUrl].some((value) =>
      value.toLowerCase().includes(query),
    ),
  )
})

const totalClicks = computed(() =>
  links.reduce((total, link) => total + link.clicks, 0),
)

const activeLinks = computed(
  () => links.filter((link) => link.status === 'Aktywny').length,
)

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
              Przykładowe dane do czasu podłączenia API.
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
    </UCard>
  </UContainer>
</template>
