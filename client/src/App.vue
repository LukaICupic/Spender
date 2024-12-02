<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <component
    :is="route.meta.layout === 'default' ? DefaultLayout : 'div'"
    :class="route.meta.layout !== 'default' ? 'app-container' : ''"
  >
    <router-view />
  </component>
</template>

<style scoped>
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Ensure it takes full viewport height */
}
</style>
