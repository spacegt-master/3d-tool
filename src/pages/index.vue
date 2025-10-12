<script lang="ts" setup>
import AppPanl from './TresApp.vue'
import { usePropertiesPanelStore } from '@/stores/properties-panle'

const propertiesPanelStore = usePropertiesPanelStore()
</script>

<template>
  <!-- <HelloWorld /> -->
  <v-layout height="100%">
    <div class="h-100 position-relative	" style="width:calc(100% - 400px)">
      <AppPanl></AppPanl>
      <v-dialog :model-value="!propertiesPanelStore.raw" max-width="610" persistent contained>
        <v-list class="py-2" color="primary" elevation="12" rounded="lg">
          <v-list-item prepend-icon="mdi-printer-3d" title="Is your FBX file here? Hurry up and find it out! We're all set to welcome it!">
            <template v-slot:prepend>
              <div class="pe-4">
                <v-icon color="primary" size="x-large"></v-icon>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-dialog>
    </div>
    <properties-panel></properties-panel>
  </v-layout> 
</template>

