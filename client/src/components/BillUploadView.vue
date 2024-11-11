<script setup lang="ts">
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
} from '@zxing/library'
import { ref, onMounted } from 'vue'

const categoryInput = ref<string | null>(null)
const amountInput = ref<string | null>(null)
const dateInput = ref<Date | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const fileUploadRef = ref<HTMLInputElement | null>(null)
const categories = ref<{ text: string; value: string }[]>([])
const selectedCategory = ref<string | null>(null)

const reader = new BrowserMultiFormatReader()
const hints = new Map<DecodeHintType, any>()
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.PDF_417,
])

onMounted(async () => {
  try {
    categories.value = await getBillCategories()
    console.log('Categories fetched:', categories.value)
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

const getBillCategories = async (): Promise<
  { text: string; value: string }[]
> => {
  try {
    const response = await fetch('http://localhost:5000/bills/categories') // Replace with actual API URL
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    return [] // Return an empty array in case of error
  }
}

// Stat scanning
const startScanner = async () => {
  try {
    await reader.decodeFromVideoDevice(null, videoRef.value, result => {
      if (result) {
        console.log('start scan result', result)
        processBillInfo(result.getText(), result.getBarcodeFormat())
        stopScanner()
      }
    })
  } catch (error) {
    console.error('Error starting camera scanner:', error)
  }
}

// Stop scanning
const stopScanner = async () => {
  try {
    reader.reset()
  } catch (error) {
    console.error('Error stopping camera scanner:', error)
  }
}

// Process the sanned/uploaded bill
const processBillInfo = async (
  decodedText: string,
  barcodeFormat: BarcodeFormat,
) => {
  try {
    const response = await fetch('http://localhost:5000/bills/send-bill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ text: decodedText, format: barcodeFormat }), // Sending the decoded text as JSON
    })

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }

    const result = await response.json()

    categoryInput.value = result.data?.category
    amountInput.value = result.data?.amount
    dateInput.value = result.data.date_of_payment?.split('T')[0]
  } catch (error) {
    console.error('Error sending data to backend:', error)
  }
}

// Upload picture
const handleFileUpload = () => {
  if (
    !fileUploadRef.value ||
    !fileUploadRef.value.files ||
    fileUploadRef.value.files.length === 0
  )
    return

  const file = fileUploadRef.value.files[0]

  const fReader = new FileReader()
  fReader.onload = ev => {
    const imageUrl = ev.target?.result as string

    if (!imageUrl) return

    reader
      .decodeFromImageUrl(imageUrl)
      .then(result => {
        console.log(result.getText())
        processBillInfo(result.getText(), result.getBarcodeFormat())
      })
      .catch(err => {
        console.error('Error decoding barcode:', err)
      })
  }

  fReader.readAsDataURL(file)
}
</script>

<template>
  <v-container>
    <v-btn color="primary" @click="startScanner">Start Scanning</v-btn>
    <v-btn color="error" @click="stopScanner">Stop Scanning</v-btn>

    <video ref="videoRef" style="width: 100%; height: auto"></video>

    <v-file-input
      ref="fileUploadRef"
      label="Upload Image"
      @change="handleFileUpload"
      accept="image/*"
      outlined
      dense
    />

    <v-select
      v-model="selectedCategory"
      :items="categories"
      label="Select a Category"
      item-title="text"
      item-value="value"
    >
    </v-select>

    <v-text-field
      v-model="amountInput"
      label="Amount"
      type="number"
      outlined
      dense
    />

    <v-text-field
      v-model="dateInput"
      label="Date of Payment"
      type="date"
      outlined
      dense
    />
  </v-container>
</template>

<style scoped>
video {
  max-width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>
