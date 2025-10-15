<template>
    <primitive v-if="model" v-for="(mash, index) in model.children" :key="mash.uuid" :object="mash"
        @click="handleMeshClick" @pointerenter="handlePointerEnter" @pointerleave="handlePointerLeave">
    </primitive>
</template>

<script setup lang="ts">
import { useLoader } from '@tresjs/core'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { usePropertiesPanelStore } from '@/stores/properties-panle'
import { markRaw, watch } from 'vue'
import * as THREE from 'three'
import { storeToRefs } from 'pinia'
import type { Mesh } from 'three'
import { MeshData, useModelStore } from '@/stores/model'

const propertiesPanelStore = usePropertiesPanelStore()
const modelStore = useModelStore()

const { width, height, deep } = storeToRefs(propertiesPanelStore)
const { modelOriginalSize, meshesData, isModelReady } = storeToRefs(modelStore)

const props = defineProps({
    url: {
        type: String,
        required: true
    }
})

const { state: model, isLoading } = useLoader(FBXLoader, props.url)

// 🌟 【核心】定义高亮材质：使用 MeshBasicMaterial 实现纯色高亮，性能最好。
const HOVER_MATERIAL = markRaw(new THREE.MeshBasicMaterial({
    color: 0xFBB03B, // 使用你之前描边用的黄色/橙色
    transparent: true,
    opacity: 0.8, // 略微透明，可以看到原始细节，效果更好
}));
// 🌟 【核心】存储原始材质的 Map，key: Mesh 对象, value: 原始材质或材质数组。
const originalMaterials = new Map<Mesh, THREE.Material | THREE.Material[]>();

watch(model, () => {
    if (isLoading.value) return

    if (model.value) {
        modelStore.model = model.value

        const meshes = model.value.children as Mesh[]
        const box = new THREE.Box3().setFromObject(model.value);
        const size = new THREE.Vector3();
        box.getSize(size);

        modelOriginalSize.value = size.clone()
        width.value = Math.round(size.x * 10) / 10
        height.value = Math.round(size.y * 10) / 10
        deep.value = Math.round(size.z * 10) / 10

        meshes.forEach((child: Mesh) => {
            if (child.isMesh) {
                // 🌟 关键：克隆材质并存储原始材质。这能确保我们不会影响到其他共享材质的 Mesh。
                const originalMaterial = Array.isArray(child.material) ? child.material.map(mat => mat.clone()) : child.material.clone();
                originalMaterials.set(child, originalMaterial);

                // modelStore.adsorptionFramework(child)

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

                const meshData = new MeshData(child.name, child, originalPosition, originalSize, thicknessAxis as "x" | "y" | "z")

                modelStore.calculationFormula(meshData)

                meshesData.value.push(meshData);
            }
        })
        console.log(meshesData)
        isModelReady.value = true;
    } else {
        meshesData.value = []
    }
})

/**
 * 处理 Mesh 点击事件：触发你的 CVZJ 业务逻辑
 */
function handleMeshClick(event: any) {
    // event.object 就是被点击的 THREE.Mesh 对象
    const clickedMesh = event.object as THREE.Mesh;
    // 查找并处理对应的数据
    const selectedData = meshesData.value.find(data => data.mesh.uuid === clickedMesh.uuid);

    if (selectedData) {
        modelStore.selectedData = selectedData
    }
}

/**
 * 🌟 简化后的鼠标移入：只存原色，不再克隆
 */
function handlePointerEnter(event: any) {
    const enteredMesh = event.object as Mesh;
    if (enteredMesh && enteredMesh.isMesh) {
        // 只有当Mesh有原始材质记录时才进行替换，避免操作不相关的对象
        if (originalMaterials.has(enteredMesh)) {
            enteredMesh.material = HOVER_MATERIAL; // 🌟 核心高亮
        }
    }
}

/**
 * 🌟 简化后的鼠标移出：恢复原色
 */
function handlePointerLeave(event: any) {
    const leftMesh = event.object as Mesh;
    if (leftMesh && leftMesh.isMesh) {
        const originalMaterial = originalMaterials.get(leftMesh);
        // 只有当Mesh有原始材质记录时才进行恢复
        if (originalMaterial) {
            leftMesh.material = originalMaterial; // 🌟 核心恢复
        }
    }
}

</script>

<style scoped></style>