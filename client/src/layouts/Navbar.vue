<script lang="ts">
export default {
  data() {
    return {
      drawer: false,
    }
  },
}
</script>

<template>
  <nav>
    <v-toolbar flat app>
      <v-icon>
        <span>Open menu</span>
      </v-icon>
      <v-toolbar-title>
        <span>TODO</span>
        <span>NINJA</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat color="grey">
        <span>Sign Out</span>
        <v-icon right>exit_to_app</v-icon>
      </v-btn>
    </v-toolbar>

    <v-navigation-drawer v-model="drawer" app style="background-color: blue">
      <p>Test</p>
    </v-navigation-drawer>
  </nav>
</template>
