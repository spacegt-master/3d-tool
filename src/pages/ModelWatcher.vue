<script setup lang="ts">
import { useTresContext } from '@tresjs/core'
import { watch, ref } from 'vue'
import * as THREE from 'three'
import { usePropertiesPanelStore, centimeter2millimeter, adsorptionFramework, calculationFormula, MeshData } from '@/stores/properties-panle';
import { storeToRefs } from 'pinia'
import type { Object3D } from 'node_modules/@types/three';

const { scene } = useTresContext()
const propertiesPanelStore = usePropertiesPanelStore()

// 从 Pinia store 中获取所有响应式数据
const { raw, fbxModel, fbxOriginalSize, width, height, deep, panelThickness, panelThicknessUnification, meshesData } = storeToRefs(propertiesPanelStore)

// 新增：模型加载完成的标志
const isModelReady = ref(false)

// 监听 raw 文件的变化，当新文件上传时，重新初始化模型数据
watch(raw, (newRaw) => {
    if (!newRaw || !scene.value) {
        // 如果文件被移除或场景不存在，重置状态
        isModelReady.value = false;
        meshesData.value.length = 0;
        return;
    }

    // 在下一个 tick 确保模型已渲染到场景中
    setTimeout(() => {
        const fbxModelInstance = scene.value.children.find(child => child.type === 'Group');
        if (fbxModelInstance) {
            fbxModel.value = fbxModelInstance;

            const box = new THREE.Box3().setFromObject(fbxModel.value);
            const size = new THREE.Vector3();
            box.getSize(size);

            fbxOriginalSize.value = centimeter2millimeter(size.clone());
            width.value = centimeter2millimeter(size.x) as number;
            height.value = centimeter2millimeter(size.y) as number;
            deep.value = centimeter2millimeter(size.z) as number;

            fbxModelInstance.traverse((child: any) => {
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
            });
            isModelReady.value = true;
        }
    }, 100);
});

// 监听 store 中尺寸和厚度的变化，并对每个木板进行缩放和定位
watch([width, height, deep, panelThickness, panelThicknessUnification], ([newWidth, newHeight, newDeep, newThickness, panelThicknessUnification]) => {
    // 如果模型数据未加载完成，则立即退出
    if (!isModelReady.value) return;
    if (meshesData.value.length === 0 || !fbxOriginalSize.value) return;

    // 计算整体缩放比例
    const scaleFactorX = newWidth / fbxOriginalSize.value.x;
    const scaleFactorY = newHeight / fbxOriginalSize.value.y;
    const scaleFactorZ = newDeep / fbxOriginalSize.value.z;

    meshesData.value.forEach(data => {
        const mesh = data.mesh;
        const originalSize = data.originalSize;
        const originalPosition = data.originalPosition;
        const thicknessAxis = data.thicknessAxis;

        let newScaleX, newScaleY, newScaleZ;

        // 根据厚度轴，应用新的尺寸
        if (thicknessAxis === 'x') {
            // 新的比例 = (目标厚度 / 原始厚度) * 原始 scale
            if (panelThicknessUnification) newScaleX = (newThickness / originalSize.x) * originalSize.x;
            else newScaleX = originalSize.x;
            // 保持其他轴的相对比例
            newScaleY = originalSize.y * scaleFactorY;
            newScaleZ = originalSize.z * scaleFactorZ;
        } else if (thicknessAxis === 'y') {
            newScaleX = originalSize.x * scaleFactorX;
            if (panelThicknessUnification) newScaleY = (newThickness / originalSize.y) * originalSize.y;
            else newScaleY = originalSize.y;
            newScaleZ = originalSize.z * scaleFactorZ;
        } else if (thicknessAxis === 'z') {
            newScaleX = originalSize.x * scaleFactorX;
            newScaleY = originalSize.y * scaleFactorY;
            if (panelThicknessUnification) newScaleZ = (newThickness / originalSize.z) * originalSize.z;
            else newScaleZ = originalSize.z;
        }

        // 应用新的大小和位置
        mesh.scale.set(newScaleX, newScaleY, newScaleZ);
        mesh.position.set(originalPosition.x * scaleFactorX, originalPosition.y * scaleFactorY, originalPosition.z * scaleFactorZ);
    });
});
</script>

<template>
    <slot />
</template>