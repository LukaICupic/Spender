<script setup lang="ts">
import type { CategoryResponseDto } from '@/dtos/category'
import { getRequest, postRequest } from '@/utils'
import { onMounted, ref, watch, type PropType } from 'vue'

const props = defineProps({
  foundCategory: {
    type: [Number, Array] as PropType<number | number[]>, // Explicitly define the type
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  context: {
    type: String,
    default: 'AnalyticsView',
  },
})

const serverError = ref<string | null>(null)
const dialogActive = ref(false)
const categoryName = ref<string | null>(null)
const categories = ref<{ name: string; id: string }[] | undefined>([])
const selectedCategory = ref<number | number[]>(props.foundCategory || [])
const emit = defineEmits(['update:category'])
const categoryRules = [
  (value: any) => {
    if (props.context === 'BillUpload') {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return 'A category needs to be selected.'
      }
    }
    return true
  },
]

watch(
  () => props.foundCategory,
  newFoundCategory => {
    selectedCategory.value = newFoundCategory
  },
)

// Emit internal state changes to the parent
watch(selectedCategory, newSelectedCategory => {
  emit('update:category', newSelectedCategory)
})

//Watch changes on the props and update accordinglly
watch(
  () => props.foundCategory,
  newValue => {
    selectedCategory.value = newValue
  },
)

onMounted(async () => {
  try {
    await getBillCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

const getBillCategories = async () => {
  try {
    const response = await getRequest('/categories')
    const responseData: CategoryResponseDto = await response.json()

    if (responseData.error) {
      categories.value = []
    } else categories.value = responseData?.data ?? []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const handleSave = async () => {
  try {
    const response = await postRequest('/category-save', {
      name: categoryName.value,
    })

    if (!response.ok) {
      var responseData = await response.json()
      serverError.value = responseData.error
    } else {
      serverError.value = null
      categoryName.value = null
      await getBillCategories()
      dialogActive.value = false
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}
</script>
<template>
  <v-select
    v-model="selectedCategory"
    :multiple="props.multiple"
    :items="categories"
    class="mb-3"
    variant="outlined"
    density="compact"
    label="Category"
    item-title="name"
    item-value="id"
    :rules="categoryRules"
  >
    <template #prepend-item v-if="props.context === 'BillUpload'">
      <v-btn
        variant="text"
        icon="mdi-plus-circle-outline"
        @click="dialogActive = true"
      ></v-btn>
    </template>
  </v-select>

  <v-dialog v-model="dialogActive" max-width="500">
    <v-card>
      <v-card-text>
        <v-text-field
          v-model="categoryName"
          label="Category name"
          variant="underlined"
          density="compact"
          type="text"
          :error-messages="serverError ? [serverError] : []"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" text="Save" @click="handleSave"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
