import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import {
  VTooltip,
  VRow,
  VCol,
  VApp,
  VAppBar,
  VFileInput,
  VNavigationDrawer,
  VList,
  VListItem,
  VDivider,
  VMain,
  VLayout,
  VCard,
  VToolbar,
  VToolbarTitle,
  VIcon,
  VBtn,
  VTextField,
  VContainer,
  VSelect,
  VImg,
  VSpacer,
} from 'vuetify/components'

export default createVuetify({
  components: {
    VTooltip,
    VRow,
    VCol,
    VApp,
    VAppBar,
    VFileInput,
    VNavigationDrawer,
    VList,
    VListItem,
    VDivider,
    VMain,
    VLayout,
    VCard,
    VToolbar,
    VToolbarTitle,
    VIcon,
    VBtn,
    VTextField,
    VContainer,
    VSelect,
    VImg,
    VSpacer,
  },
  theme: {
    defaultTheme: 'light',
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
