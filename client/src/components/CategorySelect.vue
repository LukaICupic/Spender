<script setup lang="ts">
import type { CategoryDto, CategoryResponseDto } from '@/dtos/bills'
import { onMounted, ref, watch, type PropType } from 'vue'

const props = defineProps({
  foundCategory: {
    type: [String, Array] as PropType<string | string[]>, // Explicitly define the type
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  context: {
    type: String,
    default: 'StatisticsView',
  },
})

const categories = ref<{ text: string; value: string }[] | undefined>([])
const selectedCategory = ref<string | string[]>(props.foundCategory || []) // Default to an array if `multiple` is true
const emit = defineEmits(['update:category'])
const categoryRules = [
  (value: any) => {
    if (props.context === 'BillUpload') {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return 'A category needs to be selected.'
      }
    } else if (props.context === 'Statistics') {
      if (value && (Array.isArray(value) ? value.length <= 0 : value === '')) {
        return 'At least one category needs to be selected.'
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
    categories.value = await getBillCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

const getBillCategories = async (): Promise<CategoryDto[] | undefined> => {
  try {
    const response = await fetch('http://localhost:5000/bills/categories')

    const responseData: CategoryResponseDto = await response.json()

    if (responseData.error) {
      return []
    } else return responseData?.data ?? []
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
    label="Category"
    item-title="text"
    item-value="value"
    :rules="categoryRules"
  />
</template>
