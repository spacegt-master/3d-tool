<script setup lang="ts">
import ModelLoader from './ModelLoader.vue'
import ModelWatcher from './ModelWatcher.vue' // 导入你的新组件
import { BasicShadowMap, SRGBColorSpace, NoToneMapping, ACESFilmicToneMapping } from 'three';
import { OrbitControls, Environment } from '@tresjs/cientos'
import { usePropertiesPanelStore, getRawBlobUrl } from '@/stores/properties-panle'
import { storeToRefs } from 'pinia';

const propertiesPanelStore = usePropertiesPanelStore()

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
</script>

<template>
  <TresCanvas v-bind="gl">
    <TresPerspectiveCamera :position="[400, 400, 400]" />
    <OrbitControls />

    <Environment :background="true" :files="hdrPath" :blur="0.35" />

    <TresDirectionalLight :position="[150, 200, 250]" :intensity="1.5" cast-shadow />

    <TresDirectionalLight :position="[-150, 100, -200]" :intensity="0.8" />

    <TresDirectionalLight :position="[0, 200, -250]" :intensity="1.0" />

    <TresAmbientLight :intensity="0.5" />

    <ModelLoader v-if="raw" :url="getRawBlobUrl()" />

    <ModelWatcher v-if="raw" />
  </TresCanvas>
</template>