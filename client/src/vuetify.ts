// src/plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import 'vuetify/styles' // Import Vuetify styles
import {
  VFileInput,
  VTextField,
  VContainer,
  VBtn,
  VInput,
  VSelect,
} from 'vuetify/components' // Import VFileInput

// Create and export the Vuetify instance
export default createVuetify({
  components: {
    VSelect,
    VInput,
    VBtn,
    VContainer,
    VTextField, // Register VTextField
    VFileInput, // Register VFileInput explicitly
  },
  theme: {
    defaultTheme: 'light',
  },
})
