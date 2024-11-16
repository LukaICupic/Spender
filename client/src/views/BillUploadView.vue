<script setup lang="ts">
import type {
  BillResponseDto,
  CategoryDto,
  CategoryResponseDto,
} from '@/dtos/bills'
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import { ref, onMounted } from 'vue'

const amountInput = ref<string | null>(null)
const dateInput = ref<Date | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const fileUploadRef = ref<HTMLInputElement | null>(null)
const categories = ref<{ text: string; value: string }[]>([])
const selectedCategory = ref<string | null>(null)

const codeReader = new BrowserMultiFormatReader()

onMounted(async () => {
  try {
    categories.value = await getBillCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

const handleBillsSaving = async () => {
  try {
    const response = await fetch('http://localhost:5000/bills/save-bill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        category: selectedCategory.value,
        amount: amountInput.value,
        date: dateInput.value ? new Date(dateInput.value) : null,
      }),
    })

    const responseData: BillResponseDto = await response.json()
    if (responseData.error) {
      console.error(`Server error: ${responseData.error}`)
    }

    console.log('Message for user:', responseData.message)
  } catch (error) {
    console.error('Error sending data to backend:', error)
  }
}

const getBillCategories = async (): Promise<CategoryDto[]> => {
  try {
    const response = await fetch('http://localhost:5000/bills/categories')

    const responseData: CategoryResponseDto = await response.json()

    if (responseData.error) {
      console.error(`Server error: ${responseData.error}`)
    }

    return responseData?.data ?? []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Stat scanning
const startScanner = async () => {
  try {
    const videoInputDevices =
      await BrowserMultiFormatReader.listVideoInputDevices()
    const selectedDeviceId = videoInputDevices[0].deviceId
    const previewElem = videoRef.value

    if (previewElem) {
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        previewElem,
        result => {
          if (result) {
            processBillInfo(result.getText(), result.getBarcodeFormat())
          }
        },
      )
    }
  } catch (error) {
    console.error('Error starting camera scanner:', error)
  }
}

// Stop scanning
const stopScanner = async () => {
  if (videoRef.value) {
    videoRef.value.srcObject = null
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
      body: JSON.stringify({ content: decodedText, format: barcodeFormat }),
    })

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }

    const result = await response.json()

    if (result.data?.category) selectedCategory.value = result.data?.category
    amountInput.value = result.data?.amount
    dateInput.value = result.data.date_of_payment?.split('T')[0]
  } catch (error) {
    console.error('Error sending data to backend:', error)
  }
}

// Upload picture
const handleFileUpload = async () => {
  if (
    !fileUploadRef.value ||
    !fileUploadRef.value.files ||
    fileUploadRef.value.files.length === 0
  )
    return

  const file = fileUploadRef.value.files[0]

  const fReader = new FileReader()

  try {
    const imageUrl = await new Promise<string>((resolve, reject) => {
      fReader.onload = ev => {
        const imageUrl = ev.target?.result as string
        if (imageUrl) {
          resolve(imageUrl)
        } else {
          reject(new Error('Failed to read image file'))
        }
      }

      fReader.onerror = () => {
        reject(new Error('Error reading the file'))
      }

      fReader.readAsDataURL(file)
    })

    const result = await codeReader.decodeFromImageUrl(imageUrl)
    processBillInfo(result.getText(), result.getBarcodeFormat())
  } catch (error) {
    console.error('Error decoding barcode from image:', error)
  }
}
</script>

<template>
  <v-container>
    <video ref="videoRef" style="width: 100%; height: auto"></video>

    <v-btn color="primary" @click="startScanner">Start Scanning</v-btn>
    <v-btn color="error" @click="stopScanner">Stop Scanning</v-btn>
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

    <v-btn color="primary" @click="handleBillsSaving">Save</v-btn>
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
