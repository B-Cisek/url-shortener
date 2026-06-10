<script setup lang="ts">
defineProps<{
  url: string
}>()

defineEmits<{
  copy: []
}>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
  >
    <UCard
      v-if="url"
      variant="outline"
      class="mx-auto mt-5 max-w-2xl text-left"
      :ui="{ body: 'p-4 sm:p-5' }"
    >
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="mb-1 flex items-center gap-1.5 text-sm text-muted">
            <UIcon name="i-lucide-circle-check" class="size-4 text-success" />
            Twój skrócony link
          </p>
          <a
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="block truncate text-lg font-semibold text-primary hover:underline"
          >
            {{ url }}
          </a>
        </div>
        <UButton
          label="Kopiuj"
          icon="i-lucide-copy"
          color="neutral"
          variant="outline"
          size="lg"
          class="justify-center"
          @click="$emit('copy')"
        />
      </div>
    </UCard>
  </Transition>
</template>
