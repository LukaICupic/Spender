<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()

// Dynamically resolve the layout
const Layout = computed(() => {
  return route.meta.layout || DefaultLayout
})
</script>

<template>
  <component :is="Layout">
    <router-view />
  </component>
</template>
