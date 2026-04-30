<script setup lang="ts">
import { ref } from 'vue'
import { uploadFile } from '@/lib/api'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{ modelValue: string | null | undefined }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string | null): void }>()

const uploading = ref(false)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

async function pick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  uploading.value = true
  error.value = null
  try {
    const res = await uploadFile(f)
    emit('update:modelValue', res.url)
  } catch (err: any) {
    error.value = err?.message || 'Error al subir'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function clear() { emit('update:modelValue', null) }
</script>

<template>
  <div>
    <div v-if="modelValue" class="relative inline-block">
      <img :src="modelValue" alt="" class="w-32 h-32 object-cover rounded-lg border border-white/10" />
      <button type="button" @click="clear" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white grid place-items-center shadow" aria-label="Quitar imagen">
        <Icon name="CloseCircle" :size="14" />
      </button>
    </div>
    <div v-else class="w-32 h-32 rounded-lg border-2 border-dashed border-white/15 grid place-items-center text-white/40">
      <Icon name="Gallery" :size="36" />
    </div>

    <label class="inline-flex items-center gap-1.5 mt-2 cursor-pointer text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10">
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="pick" />
      <Icon :name="uploading ? 'Refresh' : 'GalleryAdd'" :size="14" />
      <span>{{ uploading ? 'Subiendo…' : (modelValue ? 'Reemplazar' : 'Subir imagen') }}</span>
    </label>
    <p v-if="error" class="text-xs text-accent mt-1">{{ error }}</p>
  </div>
</template>
