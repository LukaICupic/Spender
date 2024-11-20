<script lang="ts" setup>
import { ref } from 'vue'
import CategorySelect from '@/components/CategorySelect.vue'
import type { VForm } from 'vuetify/components'

const form = ref<VForm | null>(null)
const dateInput1 = ref<string | undefined>()
const dateInput2 = ref<string | undefined>()
const selectedCategories = ref<string | undefined>(undefined)
const selectedRange = ref<string | undefined>(undefined)
const ranges = ref<Array<string>>(['Godine', 'Mjeseci', 'Dani'])
const rangeRules = [
  (value: string) => {
    if (value === undefined || value === null || value === '') {
      return 'Range is required.'
    }
    return true
  },
]

const dateRules = [
  (value: string) => {
    console.log(value)
    if (value === undefined || value === null || value === '') {
      return 'Date is required.'
    }
    var convertDate = new Date(value).getFullYear()
    if (convertDate < 2024 || convertDate > new Date().getFullYear()) {
      return 'The year spans from 2024 until the current year'
    }
    return true
  },
]
const onCategorySelected = (newCategory: string | undefined) => {
  selectedCategories.value = newCategory
}

const handleStatsData = async () => {
  if ((await form.value?.validate())?.valid) {
    await fetch('http://localhost:5000/bills/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        dateFrom: dateInput1.value,
        dateTo: dateInput2.value,
        categories: selectedCategories.value,
        rangeType: selectedRange.value,
      }),
    })
    //TODO
  }
}
</script>

<template>
  <v-container>
    <v-sheet class="mx-auto">
      <canvas id="myChart" width="200" height="300"></canvas>

      <v-form ref="form" fast-fail @submit.prevent="handleStatsData">
        <CategorySelect
          :foundCategory="selectedCategories"
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

        <v-text-field
          v-model="dateInput1"
          label="Start date"
          type="date"
          outlined
          dense
          validate-on="blur"
          :rules="dateRules"
        />
        <v-text-field
          v-model="dateInput2"
          label="End date"
          type="date"
          outlined
          dense
          validate-on="blur"
          :rules="dateRules"
        />
        <v-btn block color="secondary" type="submit">Save</v-btn>
      </v-form>
    </v-sheet>
  </v-container>
</template>
