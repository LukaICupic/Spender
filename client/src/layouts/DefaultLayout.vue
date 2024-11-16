<script lang="ts">
import { mdiMenu } from '@mdi/js'
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const drawer = ref(true)
    const { mdAndUp } = useDisplay()
    const isPermanent = computed(() => mdAndUp.value)
    const router = useRouter()
    return {
      drawer,
      isPermanent,
      router,
    }
  },
}
</script>
<template>
  <v-app>
    <!-- Main Toolbar -->
    <v-toolbar
      dark
      :class="isPermanent ? 'toolbar-with-drawer' : ''"
      style="background-color: white; height: 38px"
    >
      <v-btn icon v-if="!isPermanent" @click="drawer = !drawer">
        <v-icon icon="mdi-menu" />
      </v-btn>
    </v-toolbar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app :permanent="isPermanent" rail>
      <v-list>
        <v-list-item href="/">
          <v-img
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.freebiesupply.com%2Flogos%2Flarge%2F2x%2Fvue-9-logo-png-transparent.png&f=1&nofb=1&ipt=de5dc0f638f1edb2cca688b5eedb895bba78111db84b3ea20793e37d511d3344&ipo=images"
            alt="Logo"
            max-width="30"
          />
        </v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item
            to="/"
            prepend-icon="mdi-home"
            title="Home"
            value="Home"
          />
          <v-list-item
            to="/about"
            prepend-icon="mdi-receipt-text-plus"
            title="About"
            value="About"
          />
          <v-list-item
            prepend-icon="mdi-star"
            title="Statistics"
            value="Statistics"
          />
        </v-list>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
<style>
.toolbar-with-drawer {
  margin-left: 256px;
  width: calc(100% - 256px);
}
</style>
