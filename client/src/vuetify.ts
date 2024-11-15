import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { fa } from 'vuetify/iconsets/fa'
import '@fortawesome/fontawesome-free/css/all.css'

import {
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
    defaultSet: 'fa', // Use MDI as the default set
    sets: {
      fa, // Add FontAwesome icons
    },
  },
})
