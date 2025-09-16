<script setup lang="ts">
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from 'three';
import { OrbitControls, Text3D, FBXModel } from '@tresjs/cientos'
import ModelWatcher from './ModelWatcher.vue' // 导入你的新组件
import { usePropertiesPanelStore, getRawBlobUrl } from '@/stores/properties-panle'

const propertiesPanelStore = usePropertiesPanelStore()

const gl = {
  clearColor: '#4A5568', // 新的背景颜色
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
};
</script>

<template>
  <TresCanvas v-bind="gl">
    <TresPerspectiveCamera :position="[400, 400, 400]" />
    <OrbitControls />

    <TresDirectionalLight :position="[150, 200, 250]" :intensity="1.5" cast-shadow />

    <TresDirectionalLight :position="[-150, 100, -200]" :intensity="0.8" />

    <TresDirectionalLight :position="[0, 200, -250]" :intensity="1.0" />

    <TresAmbientLight :intensity="0.5" />

    <Suspense v-if="propertiesPanelStore.raw">
      <FBXModel :path="getRawBlobUrl()" />
      <!-- <FBXModel path="/models/common_Wardrobe_DYGT_G032/common_Wardrobe_DYGT_G032.fbx" /> -->
    </Suspense>
    <ModelWatcher />
  </TresCanvas>
</template>