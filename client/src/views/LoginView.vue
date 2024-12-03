<script setup lang="ts">
import router from '@/router'
import { ref } from 'vue'
import { VForm, VTextField } from 'vuetify/components'

const userName = ref(null)
const password = ref(null)
const form = ref<VForm | null>(null)
const serverError = ref<string | null>(null)
const inputRules = (field: string) => [
  (value: any) => {
    if (!value || value === '') {
      return `${field} is required.`
    }
    return true
  },
]

const handleLogin = async () => {
  try {
    if ((await form.value?.validate())?.valid) {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            userName: userName.value,
            password: password.value,
          }),
        },
      )

      var responseData = await response.json()
      if (!response.ok) serverError.value = responseData.error

      if (responseData.data?.success) router.push({ path: 'home' })
    }
  } catch (error: any) {
    serverError.value = 'Something went wrong...'
    console.error(error)
  }
}
</script>

<template>
  <v-container class="justify-center align-center">
    <v-card style="box-shadow: none">
      <v-card-title class="d-flex justify-center">
        <v-img
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.freebiesupply.com%2Flogos%2Flarge%2F2x%2Fvue-9-logo-png-transparent.png&f=1&nofb=1&ipt=de5dc0f638f1edb2cca688b5eedb895bba78111db84b3ea20793e37d511d3344&ipo=images"
          alt="Logo"
          max-width="70"
          class="mb-4"
        />
      </v-card-title>

      <v-form ref="form" fast-fail @submit.prevent="handleLogin">
        <v-text-field
          v-model="userName"
          label="Username"
          placeholder="Username"
          type="text"
          outlined
          class="mb-4"
          :rules="inputRules('Username')"
          :error-messages="serverError ? [''] : []"
        />

        <v-text-field
          v-model="password"
          label="Password"
          placeholder="Password"
          type="text"
          outlined
          class="mb-4"
          :rules="inputRules('Password')"
          :error-messages="serverError ? [serverError] : []"
        />
        <v-btn color="secondary" type="submit" block rounded>Log In</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
