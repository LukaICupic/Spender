<script setup lang="ts">
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
} from '@zxing/library'
import { ref } from 'vue'

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
    console.log('Server response:', result)
  } catch (error) {
    console.error('Error sending data to backend:', error)
  }
}

const handler = () => {
  const input = el.value
  if (!input || !input.files || input.files.length === 0) return

  const file = input.files[0] // Get the selected file
  console.log('file', file)

  const fReader = new FileReader()
  fReader.onload = ev => {
    const imageUrl = ev.target?.result as string

    if (!imageUrl) return

    reader
      .decodeFromImageUrl(imageUrl)
      .then(result => {
        console.log('result', result)
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
  <input type="file" ref="el" @change="handler" />
</template>
