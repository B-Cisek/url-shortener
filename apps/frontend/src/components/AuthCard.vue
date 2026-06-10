<script setup lang="ts">
defineProps<{
  description: string
  icon: string
  serverError?: string
  title: string
}>()
</script>

<template>
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
          <UIcon :name="icon" class="size-6" />
        </div>
        <h1 class="text-2xl font-semibold text-highlighted">{{ title }}</h1>
        <p class="mt-2 text-sm text-muted">{{ description }}</p>
      </div>

      <UAlert
        v-if="serverError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="serverError"
        class="mb-5"
      />

      <slot />
      <slot name="footer" />
    </UCard>
  </UContainer>
</template>
