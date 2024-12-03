<script setup lang="ts">
import type {
  BillSaveResponseDto,
  MessageDto,
  UploadBillResponseDto,
} from '@/dtos/bills'
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import { ref } from 'vue'
import type { VForm } from 'vuetify/components'
import CategorySelect from '@/components/CategorySelect.vue'
import type { BillModel } from '@/models/BillModel'
import { Vue3Lottie } from 'vue3-lottie'
import PiggyAnimation from '@/assets/piggy.json'

const bill = ref<BillModel>({
  category: '',
  amount: 0,
  date: '',
})
const form = ref<VForm | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const fileUploadRef = ref<HTMLInputElement | null>(null)

const message = ref<MessageDto>({
  messageAlert: false,
  messageContent: '',
  messageType: 'error',
})
const scanningMode = ref<boolean>(false)

const codeReader = new BrowserMultiFormatReader()

//Rules
const amountRules = [
  (value: any) => {
    if (value === undefined || value === '' || value == null) {
      return 'Amount is required.'
    }
    if (value <= 0) {
      return 'Amount must be greater than 0'
    }
    return true
  },
]

const dateRules = [
  (value: any) => {
    if (value === undefined || value === null || value === '') {
      return 'Date is required.'
    }
    return true
  },
]

//handlers
const handleBillsSaving = async () => {
  if ((await form.value?.validate())?.valid) {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/bill/save-bill`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          category: bill.value.category,
          amount: bill.value.amount,
          date: new Date(bill.value.date),
        }),
      },
    )

    const responseData: BillSaveResponseDto = await response.json()
    message.value.messageAlert = true
    if (responseData.error) {
      message.value.messageType = 'warning'
      message.value.messageAlert = true
      message.value.messageContent = `${responseData.error}`
    } else {
      message.value.messageType = 'success'
      message.value.messageContent = `${responseData.message}`

      form.value?.reset()
    }
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
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/bill/send-bill`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ content: decodedText, format: barcodeFormat }),
      },
    )
    var responseData: UploadBillResponseDto = await response.json()
    if (responseData.error) {
      message.value.messageType = 'warning'
      message.value.messageAlert = true
      message.value.messageContent = `${responseData.error}`
      return
    }

    if (responseData.data?.category)
      bill.value.category = responseData.data?.category

    bill.value.amount = responseData.data.amount

    const formattedDate = new Date(responseData.data?.date_of_payment ?? '')
      .toISOString()
      .split('T')[0]
    bill.value.date = formattedDate
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

    fileUploadRef.value.value = ''
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
  <v-container class="container-wrapper">
    <v-alert
      shaped
      outlined
      :type="message.messageType"
      v-if="message.messageAlert"
      closable
      @click:close="
        () => {
          message.messageAlert = false
        }
      "
      class="alert"
    >
      {{ message.messageContent }}
    </v-alert>

    <v-row>
      <v-row class="d-flex justify-center mb-2 mt-2">
        <video
          v-if="scanningMode"
          ref="videoRef"
          style="object-fit: cover"
        ></video>
        <Vue3Lottie
          v-else
          :animationData="PiggyAnimation"
          width="100"
          height="100"
        />
      </v-row>
    </v-row>

    <v-row style="flex: none; margin: 0px">
      <!-- Hidden file input -->
      <input
        ref="fileUploadRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileUpload"
      />

      <!-- Category and Form Fields -->
      <v-sheet
        class="mx-auto"
        style="width: 100%; display: flex; flex-direction: column"
      >
        <!-- Scan and Upload Buttons Row -->
        <v-row class="mb-2">
          <v-col v-if="!scanningMode" col="6">
            <v-btn
              rounded
              color="secondary"
              block
              height="36px"
              @click="startScanner"
            >
              <v-icon left>mdi-qrcode-scan</v-icon>
              &nbsp; Scan
            </v-btn>
          </v-col>
          <v-col v-if="scanningMode" col="6">
            <v-btn
              rounded
              block
              @click="stopScanner"
              style="color: #ffff; background-color: #59d9cd"
            >
              &nbsp; Stop
            </v-btn>
          </v-col>
          <v-col col="6">
            <v-btn rounded color="secondary" block @click="triggerFileInput">
              <v-icon left>mdi-image</v-icon>
              Upload
            </v-btn>
          </v-col>
        </v-row>
        <v-form ref="form" fast-fail @submit.prevent="handleBillsSaving">
          <CategorySelect
            :foundCategory="bill.category"
            @update:category="newCategory => (bill.category = newCategory)"
            context="BillUpload"
          />

          <v-text-field
            v-model.number="bill.amount"
            label="Amount"
            type="number"
            outlined
            dense
            :rules="amountRules"
          />

          <v-text-field
            v-model="bill.date"
            label="Date of Payment"
            type="date"
            outlined
            dense
            :rules="dateRules"
          />
          <v-btn rounded block color="secondary" type="submit">Save</v-btn>
        </v-form>
      </v-sheet>
    </v-row>
  </v-container>
</template>

<style scoped>
video {
  max-width: 93%;
}

.container-wrapper {
  min-height: 90vh;
  justify-content: center;
  flex-direction: column;
  display: flex;
  padding: 0px 16px;
  overflow: hidden;
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
