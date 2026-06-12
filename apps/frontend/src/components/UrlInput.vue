<script setup lang="ts">
const url = defineModel<string>({ required: true })

defineProps<{
  error?: string
  loading?: boolean
}>()

defineEmits<{
  input: []
  submit: []
}>()
</script>

<template>
  <UCard
    variant="subtle"
    class="mx-auto mt-10 max-w-2xl text-left shadow-xl shadow-primary/5"
    :ui="{ body: 'p-4 sm:p-6' }"
  >
    <form
      class="flex flex-col gap-3 sm:flex-row sm:items-start"
      @submit.prevent="$emit('submit')"
    >
      <UFormField class="min-w-0 flex-1">
        <UInput
          v-model="url"
          type="url"
          :highlight="false"
          :aria-invalid="Boolean(error)"
          placeholder="Wklej długi link tutaj"
          size="xl"
          autocomplete="url"
          class="w-full"
          @input="$emit('input')"
        />
        <p v-if="error" class="mt-2 text-sm text-error">
          {{ error }}
        </p>
      </UFormField>
      <UButton
        type="submit"
        label="Skróć"
        size="xl"
        :loading="loading"
        :disabled="loading"
        class="justify-center uppercase font-semibold"
      />
    </form>
    <p class="mt-3 flex items-center gap-1.5 text-xs text-dimmed">
      <UIcon name="i-lucide-shield-check" class="size-3.5" />
      Bez rejestracji. Wklej link i gotowe.
    </p>
  </UCard>
</template>
