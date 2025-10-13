<template>
    <primitive v-if="model" :object="model" :scale="1.5" />
</template>

<script setup lang="ts">
import { useLoader } from '@tresjs/core'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { usePropertiesPanelStore, centimeter2millimeter, adsorptionFramework, calculationFormula, MeshData } from '@/stores/properties-panle'
import { watch } from 'vue'
import * as THREE from 'three'
import { storeToRefs } from 'pinia'
import type { Mesh } from 'three'

const propertiesPanelStore = usePropertiesPanelStore()

const { modelOriginalSize, width, height, deep, meshesData, isModelReady } = storeToRefs(propertiesPanelStore)

const props = defineProps({
    url: {
        type: String,
        required: true
    }
})

const { state: model, isLoading } = useLoader(FBXLoader, props.url)

watch(model, () => {
    if (isLoading.value) return

    if (model.value) {
        propertiesPanelStore.model = model.value

        propertiesPanelStore.meshes = model.value.children as Mesh[]

        const box = new THREE.Box3().setFromObject(model.value);
        const size = new THREE.Vector3();
        box.getSize(size);

        modelOriginalSize.value = centimeter2millimeter(size.clone());
        width.value = centimeter2millimeter(size.x) as number;
        height.value = centimeter2millimeter(size.y) as number;
        deep.value = centimeter2millimeter(size.z) as number;

        propertiesPanelStore.meshes.forEach((child: Mesh) => {
            if (child.isMesh) {
                adsorptionFramework(child)

                const originalPosition = child.position.clone();
                const originalSize = new THREE.Vector3();
                // 获取 Mesh 的实际尺寸
                new THREE.Box3().setFromObject(child).getSize(originalSize);

                // 新增：保存原始的 scale 值
                const minSize = Math.min(originalSize.x, originalSize.y, originalSize.z);
                let thicknessAxis = '';
                if (minSize === originalSize.x) thicknessAxis = 'x';
                else if (minSize === originalSize.y) thicknessAxis = 'y';
                else thicknessAxis = 'z';

                const meshData = new MeshData(child.name, child, originalPosition, centimeter2millimeter(originalSize), thicknessAxis as "x" | "y" | "z")

                calculationFormula(meshData)

                meshesData.value.push(meshData);
            }
        })

        isModelReady.value = true;
    }
})
</script>

<style scoped></style>