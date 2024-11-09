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

const el = ref<HTMLInputElement | null>(null)
const hints = new Map<DecodeHintType, any>()
const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.PDF_417]
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)

// Create the barcode reader
const reader = new BrowserMultiFormatReader(hints)

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

const handler = () => {
  const input = el.value
  if (!input || !input.files || input.files.length === 0) return

  const file = input.files[0] // Get the selected file

  const fReader = new FileReader()
  fReader.onload = ev => {
    const imageUrl = ev.target?.result as string

    if (!imageUrl) return

    reader
      .decodeFromImageUrl(imageUrl)
      .then(result => {
        processBillInfo(result.getText(), result.getBarcodeFormat())
      })
      .catch(err => {
        console.error('Error decoding barcode:', err)
      })
  }

  fReader.readAsDataURL(file) // Read the file as a data URL
}
</script>

<template>
  <v-container>
    <v-file-input
      ref="el"
      label="Upload Barcode Image"
      @change="handler"
      accept="image/*"
      outlined
      dense
    />

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
