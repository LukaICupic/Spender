<script lang="ts" setup>
import { ref } from 'vue'
import CategorySelect from '@/components/CategorySelect.vue'

const dateInput1 = ref<string | undefined>()
const dateInput2 = ref<string | undefined>()
const selectedCategory = ref<string | undefined>(undefined)
const selectedRange = ref<string | undefined>(undefined)
const ranges = ref<Array<string>>(['Godine', 'Mjeseci', 'Dani'])
const rangeRules = [
  (value: any) => {
    if (value === undefined || value === null || value === '') {
      return 'Range is required.'
    }
    return true
  },
]

const onCategorySelected = (newCategory: string | undefined) => {
  selectedCategory.value = newCategory
}
</script>

<template>
  <v-container>
    <CategorySelect
      :foundCategory="selectedCategory"
      @update:category="onCategorySelected"
      :multiple="true"
      context="Statistics"
    />

    <v-select
      v-model="selectedRange"
      :items="ranges"
      :rules="rangeRules"
      label="View by"
    />

    <v-row justify="space-around" class="mt-4">
      <v-text-field
        v-model="dateInput1"
        label="Start date"
        type="date"
        outlined
        dense
      />
      <v-spacer></v-spacer>
      <v-text-field
        v-model="dateInput2"
        label="End date"
        type="date"
        outlined
        dense
      />
    </v-row>
  </v-container>
</template>
