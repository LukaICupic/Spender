<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import CategorySelect from '@/components/CategorySelect.vue'
import type { VForm } from 'vuetify/components'
import type { ChartData } from '@/dtos/bills'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController,
  type ChartType,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController,
)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<ChartJS | null>(null)

const form = ref<VForm | null>(null)
const dateFrom = ref<string>(
  new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .split('T')[0],
)
const dateTo = ref<string>(new Date().toISOString().split('T')[0])
const selectedCategories = ref<string | undefined>(undefined)
const selectedRange = ref<string>('Mjeseci')
const ranges = ref<Array<string>>(['Godine', 'Mjeseci', 'Dani'])
const chartData = ref<ChartData>({
  labels: [],
  datasets: [],
})
const categoryColors: { [key: string]: string } = {
  Nabavka: 'rgba(75, 192, 192, 0.5)',
  Režije: 'rgba(255, 99, 132, 0.5)',
  Transport: 'rgba(54, 162, 235, 0.5)',
  'Osobna njega': 'rgba(153, 102, 255, 0.5)',
  Zabava: 'rgba(255, 206, 86, 0.5)',
  Ostalo: 'rgba(201, 203, 207, 0.5)',
}

let config = {
  type: 'bar' as ChartType,
  data: chartData.value,
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  },
}

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

onMounted(async () => {
  try {
    await handleStatsData()
  } catch (error) {
    console.error('Error handling stat data', error)
  }
})

const handleStatsData = async () => {
  try {
    if ((await form.value?.validate())?.valid) {
      var response = await fetch('http://localhost:5000/bills/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          dateFrom: dateFrom.value,
          dateTo: dateTo.value,
          categories: selectedCategories.value,
          rangeType: selectedRange.value,
        }),
      })

      var result = await response.json()

      //Creating unique array of dates
      const labels = [
        ...new Set(result.data.map((ele: any) => ele.date)),
      ] as string[]

      const datasets = result.data.reduce((acc: any, ele: any) => {
        //If category does not exist on the empty object, add it as the key and populate with initial data
        if (!acc[ele.category]) {
          acc[ele.category] = {
            label: ele.category,
            data: new Array(labels.length).fill(0), // Initialize with zeros
            backgroundColor:
              categoryColors[ele.category] || 'rgba(75, 192, 192, 0.2)',
          }
        }

        //Get index of label array element and insert in the same place in "data" the amount of
        const dateIndex = labels.indexOf(ele.date)
        if (dateIndex !== -1) {
          acc[ele.category].data[dateIndex] = ele.totalAmount // Update with totalAmount
        }

        return acc
      }, {})

      chartData.value = {
        labels: labels,
        datasets: Object.values(datasets),
      }

      if (chartInstance.value) chartInstance.value.destroy()

      config.data = chartData.value
      chartInstance.value = new ChartJS(chartCanvas.value!, config)
    }
  } catch (error: any) {
    console.error('Error in handleStatsData:', error)
  }
}
</script>

<template>
  <v-container>
    <v-sheet class="mx-auto">
      <canvas ref="chartCanvas" style="max-width: 100%; height: 400px"></canvas>
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
          v-model="dateFrom"
          label="Start date"
          type="date"
          outlined
          dense
          validate-on="blur"
          :rules="dateRules"
        />
        <v-text-field
          v-model="dateTo"
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
