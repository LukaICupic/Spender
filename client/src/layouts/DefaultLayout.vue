<script lang="ts">
export default {
  data() {
    return {
      drawer: false, // Controls the open/close state of the navigation drawer
    }
  },
}
</script>

<template>
  <v-app class="grey lighten-4">
    <!-- Main Toolbar always on top -->
    <v-toolbar app dark class="indigo">
      <v-btn icon @click="drawer = !drawer">
        <!-- Button to toggle drawer -->
        <v-icon>
          <span>aaaaaa</span>
        </v-icon>
        <!-- Material Design Menu Icon -->
      </v-btn>
      <v-toolbar-title class="headline text-uppercase">
        <span>Title of Application</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <!-- Navigation Drawer on the left -->
    <v-navigation-drawer
      v-model="drawer"
      app
      style="background-color: blue"
      scrim
    >
      <v-list>
        <v-list-item>
          <v-icon left>mdi-home</v-icon>
          <span>Home</span>
        </v-list-item>
        <v-list-item>
          <v-icon left>mdi-information</v-icon>
          <span>About</span>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
/* Optional: Adjust padding/margins if necessary */
</style>
