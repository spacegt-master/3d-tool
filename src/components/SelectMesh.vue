<template>
    <TresCanvas v-bind="gl">
        <TresPerspectiveCamera :position="[200, 200, 200]" :far="5000" />
        <OrbitControls />

        <TresDirectionalLight :position="[150, 200, 250]" :intensity="1.5" cast-shadow />

        <TresDirectionalLight :position="[-150, 100, -200]" :intensity="0.8" />

        <TresDirectionalLight :position="[0, 200, -250]" :intensity="1.0" />

        <TresAmbientLight :intensity="0.5" />

        <primitive v-if="model" v-for="(mash, index) in model.children" :key="mash.uuid" :object="mash"
            @click="handleMeshClick" @pointerenter="handlePointerEnter" @pointerleave="handlePointerLeave">
        </primitive>
    </TresCanvas>
</template>

<script setup lang="ts">
import { BasicShadowMap, SRGBColorSpace, ACESFilmicToneMapping, Mesh, Material, MeshBasicMaterial } from 'three';
import { OrbitControls } from '@tresjs/cientos'
import { markRaw, watch } from 'vue';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { useLoader, TresCanvas } from '@tresjs/core'

const defaultModel = defineModel()

const props = defineProps({
    url: {
        type: String,
        required: true
    }
})

const gl = {
    clearColor: '#ffffff', // 新的背景颜色
    shadows: true,
    alpha: false,
    shadowMapType: BasicShadowMap,
    outputColorSpace: SRGBColorSpace,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
};

const { state: model, isLoading } = useLoader(FBXLoader, props.url)

// 🌟 【核心】定义高亮材质：使用 MeshBasicMaterial 实现纯色高亮，性能最好。
const HOVER_MATERIAL = markRaw(new MeshBasicMaterial({
    color: 0xFBB03B, // 使用你之前描边用的黄色/橙色
    transparent: true,
    opacity: 0.8, // 略微透明，可以看到原始细节，效果更好
}));
// 🌟 【核心】存储原始材质的 Map，key: Mesh 对象, value: 原始材质或材质数组。
const originalMaterials = new Map<Mesh, Material | Material[]>();


watch(model, () => {
    if (isLoading.value) return

    if (model.value) {
        const meshes = model.value.children as Mesh[]

        meshes.forEach((child: Mesh) => {
            if (child.isMesh) {
                // 🌟 关键：克隆材质并存储原始材质。这能确保我们不会影响到其他共享材质的 Mesh。
                const originalMaterial = Array.isArray(child.material) ? child.material.map(mat => mat.clone()) : child.material.clone();
                originalMaterials.set(child, originalMaterial);
            }
        })
    }
})


/**
 * 🌟 核心清理函数：移除 Mesh 上的所有 TresJS/Vue 事件监听器
 */
function disposeEvents(mesh: Mesh) {
    if (mesh._listeners) {
        delete mesh._listeners;
    }
}


/**
 * 处理 Mesh 点击事件：触发你的 CVZJ 业务逻辑
 */
function handleMeshClick(event: any) {
    const clickedMesh = event.object as Mesh;

    handlePointerLeave(event)

    disposeEvents(clickedMesh)

    defaultModel.value = markRaw(clickedMesh)
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