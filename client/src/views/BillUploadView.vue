<script setup lang="ts">
import type {
  BillResponseDto,
  CategoryDto,
  CategoryResponseDto,
  UploadBillDto,
} from '@/dtos/bills'
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import { ref, onMounted } from 'vue'

const amountInput = ref<number | undefined>()
const dateInput = ref<string | undefined>()
const videoRef = ref<HTMLVideoElement | null>(null)
const fileUploadRef = ref<HTMLInputElement | null>(null)
const categories = ref<{ text: string; value: string }[] | undefined>([])
const selectedCategory = ref<string | null>(null)
const messageAlert = ref<boolean>(false)
const messageType = ref<'success' | 'info' | 'warning' | 'error'>('success')
const messageContent = ref<string | null>(null)
const scanningMode = ref<boolean>(false)

const codeReader = new BrowserMultiFormatReader()

onMounted(async () => {
  try {
    categories.value = await getBillCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

const handleBillsSaving = async () => {
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
  messageAlert.value = true
  if (responseData.error) {
    messageType.value = 'warning'
    messageAlert.value = true
    messageContent.value = `${responseData.error}`
  } else {
    messageType.value = 'success'
    messageContent.value = `${responseData.message}`
  }
}

const getBillCategories = async (): Promise<CategoryDto[] | undefined> => {
  try {
    const response = await fetch('http://localhost:5000/bills/categories')

    const responseData: CategoryResponseDto = await response.json()

    if (responseData.error) {
      messageType.value = 'warning'
      messageAlert.value = true
      messageContent.value = `${responseData.error}`
      return []
    } else return responseData?.data ?? []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Stat scanning
const startScanner = async () => {
  scanningMode.value = true
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
  scanningMode.value = false
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
    var responseData: UploadBillDto = await response.json()
    if (responseData.error) {
      messageType.value = 'warning'
      messageAlert.value = true
      messageContent.value = `${responseData.error}`
    }

    if (responseData.data?.category)
      selectedCategory.value = responseData.data?.category

    amountInput.value = responseData.data?.amount
    const formattedDate = new Date(responseData.data?.date_of_payment ?? '')
      .toISOString()
      .split('T')[0]
    dateInput.value = formattedDate
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

const triggerFileInput = () => {
  const fileInput = fileUploadRef.value
  if (fileInput) fileInput.click() // Triggers the file input dialog
}
</script>

<template>
  <v-container>
    <v-alert
      shaped
      outlined
      :type="messageType"
      v-if="messageAlert"
      closable
      @click:close="
        () => {
          messageAlert = false
        }
      "
      class="alert"
    >
      {{ messageContent }}
    </v-alert>

    <!-- Scan and Upload Buttons Row -->
    <v-row v-if="!scanningMode" class="mb-4 mt-4">
      <v-col col="5">
        <v-btn color="secondary" block @click="startScanner">
          <v-icon left>mdi-qrcode-scan</v-icon>
          Scan
        </v-btn>
      </v-col>
      <v-col col="5">
        <v-btn color="secondary" block @click="triggerFileInput">
          <v-icon left>mdi-image</v-icon>
          Upload
        </v-btn>
      </v-col>
    </v-row>

    <!-- Hidden file input -->
    <input
      ref="fileUploadRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileUpload"
    />

    <!-- Video and Stop Button when scanning -->
    <v-row v-if="scanningMode" class="d-flex justify-center align-center mb-4">
      <video ref="videoRef"></video>
    </v-row>
    <v-btn
      block
      v-if="scanningMode"
      color="error"
      @click="stopScanner"
      class="mt-2 mb-6"
      >Stop</v-btn
    >

    <!-- Category and Form Fields -->
    <v-select
      v-model="selectedCategory"
      :items="categories"
      label="Select a Category"
      item-title="text"
      item-value="value"
    />

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
    <v-btn block color="secondary" @click="handleBillsSaving">Save</v-btn>
  </v-container>
</template>

<style scoped>
video {
  max-width: 95%;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 16px;
  margin-top: 16px;
}

.alert {
  position: fixed;
  top: 10px;
  left: 50%;
  z-index: 1;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
