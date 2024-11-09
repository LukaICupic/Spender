<script setup lang="ts">
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import { ref } from 'vue';

// Reference to the file input element
const el = ref<HTMLInputElement | null>(null);

// Set up the decoding hints for the reader
const hints = new Map<DecodeHintType, any>();
const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.PDF_417];
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

// Create the barcode reader
const reader = new BrowserMultiFormatReader(hints);

// Handler for file input change
const handler = () => {
  const input = el.value;
  if (!input || !input.files || input.files.length === 0) return;

  const file = input.files[0]; // Get the selected file
  console.log("file", file);

  const fReader = new FileReader();
  fReader.onload = (ev) => {
    const imageUrl = ev.target?.result as string;

    if (!imageUrl) return;

    reader.decodeFromImageUrl(imageUrl)
      .then((result) => {
        console.log(result.getText());
      })
      .catch((err) => {
        console.error("Error decoding barcode:", err);
      });
  };

  fReader.readAsDataURL(file); // Read the file as a data URL
};
</script>

<template>
  <input type="file" ref="el" @change="handler" />
</template>