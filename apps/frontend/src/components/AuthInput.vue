<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    autocomplete?: string
    error?: string
    icon: string
    label: string
    placeholder: string
    type?: 'email' | 'password' | 'text'
  }>(),
  {
    autocomplete: undefined,
    error: '',
    type: 'text',
  },
)

defineEmits<{
  input: []
}>()
</script>

<template>
  <UFormField :label="label" required>
    <UInput
      v-model="model"
      :type="type"
      color="neutral"
      :highlight="false"
      :aria-invalid="Boolean(error)"
      :placeholder="placeholder"
      :icon="icon"
      :autocomplete="autocomplete"
      size="xl"
      class="w-full"
      @input="$emit('input')"
    />
    <p v-if="error" class="mt-2 text-sm text-error">
      {{ error }}
    </p>
  </UFormField>
</template>
