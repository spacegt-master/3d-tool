<script setup lang="ts">
import { BasicShadowMap, SRGBColorSpace, ACESFilmicToneMapping } from 'three';
import { OrbitControls, Environment } from '@tresjs/cientos'
import { usePropertiesPanelStore } from '@/stores/properties-panle'
import { storeToRefs } from 'pinia';
import { onUnmounted, ref, watch } from 'vue';
import { useTweakpaneStore } from '@/stores/tweakpane';
import { useModelStore } from '@/stores/model';

const propertiesPanelStore = usePropertiesPanelStore()
const tweakpaneStore = useTweakpaneStore()
const modelStore = useModelStore()

const { raw } = storeToRefs(propertiesPanelStore)

const gl = {
  clearColor: '#6e7786', // 新的背景颜色
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: 1.2,
};

const hdrPath = '/hdr/venice_sunset_1k.hdr';

const paneContainer = ref<HTMLElement>()

watch(() => modelStore.selectedData, () => {
  tweakpaneStore.init(paneContainer.value)
})

// Clean up on unmount
onUnmounted(() => {
  tweakpaneStore.dispose()
})
</script>

<template>
  <div class="h-100 w-100">
    <div ref="paneContainer" class="pane-container" />

    <TresCanvas v-bind="gl">
      <TresPerspectiveCamera :position="[400, 400, 400]" :far="5000" />
      <OrbitControls />

      <Suspense>
        <Environment :background="true" :files="hdrPath" :blur="0.35" />
      </Suspense>

      <TresDirectionalLight :position="[150, 200, 250]" :intensity="1.5" cast-shadow />

      <TresDirectionalLight :position="[-150, 100, -200]" :intensity="0.8" />

      <TresDirectionalLight :position="[0, 200, -250]" :intensity="1.0" />

      <TresAmbientLight :intensity="0.5" />

      <ModelLoader v-if="raw" :url="propertiesPanelStore.getRawBlobUrl()" />

      <ModelWatcher v-if="raw" />

    </TresCanvas>
  </div>
</template>
<style scoped>
.pane-container {
  position: absolute;
  top: 10px;
  right: 60px;
  z-index: 10;
}
</style>