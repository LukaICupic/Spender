<script setup lang="ts">
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
} from '@zxing/library'
import { ref } from 'vue'

const categoryInput = ref<string | null>(null)
const amountInput = ref<string | null>(null)
const dateInput = ref<Date | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const reader = new BrowserMultiFormatReader()
const hints = new Map<DecodeHintType, any>()
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.PDF_417,
])

const startScanner = async () => {
  try {
    await reader.decodeFromVideoDevice(null, videoRef.value, result => {
      if (result) {
        console.log('start scan result', result)
        processBillInfo(result.getText(), result.getBarcodeFormat())
        stopScanner() // Stop scanning once barcode is read
      }
    })
  } catch (error) {
    console.error('Error starting camera scanner:', error)
  }
}

const stopScanner = async () => {
  try {
    reader.reset()
  } catch (error) {
    console.error('Error stopping camera scanner:', error)
  }
}

// Handler for file input change
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

    categoryInput.value = result.data.category
    amountInput.value = result.data.amount
    dateInput.value = result.data.date_of_payment.split('T')[0]
  } catch (error) {
    console.error('Error sending data to backend:', error)
  }
}
</script>

<template>
  <v-container>
    <v-btn color="primary" @click="startScanner">Start Scanning</v-btn>
    <v-btn color="error" @click="stopScanner">Stop Scanning</v-btn>

    <video ref="videoRef" style="width: 100%; height: auto"></video>

    <v-text-field
      v-model="categoryInput"
      label="Category / Payee Name"
      outlined
      dense
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
