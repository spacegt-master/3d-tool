<script setup lang="ts">
import { watch, ref } from 'vue'
import { usePropertiesPanelStore } from '@/stores/properties-panle';
import { storeToRefs } from 'pinia'

const propertiesPanelStore = usePropertiesPanelStore()

// 从 Pinia store 中获取所有响应式数据
const { modelOriginalSize, width, height, deep, panelThickness, panelThicknessUnification, meshesData, isModelReady } = storeToRefs(propertiesPanelStore)


// 监听 store 中尺寸和厚度的变化，并对每个木板进行缩放和定位
watch([width, height, deep, panelThickness, panelThicknessUnification], ([newWidth, newHeight, newDeep, newThickness, panelThicknessUnification]) => {
    // 如果模型数据未加载完成，则立即退出
    if (!isModelReady.value) return;
    if (meshesData.value.length === 0 || !modelOriginalSize.value) return;

    // 计算整体缩放比例
    const scaleFactorX = newWidth / modelOriginalSize.value.x;
    const scaleFactorY = newHeight / modelOriginalSize.value.y;
    const scaleFactorZ = newDeep / modelOriginalSize.value.z;

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