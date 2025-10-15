<template>
    <TresCanvas v-bind="gl">
        <TresPerspectiveCamera :position="[200, 200, 200]" :far="5000" />
        <OrbitControls />

        <TresDirectionalLight :position="[150, 200, 250]" :intensity="1.5" cast-shadow />

        <TresDirectionalLight :position="[-150, 100, -200]" :intensity="0.8" />

        <TresDirectionalLight :position="[0, 200, -250]" :intensity="1.0" />

        <TresAmbientLight :intensity="0.5" />

        <!-- 🌟 仅保留 Mesh 及其 BoxHelper，不再附加任何鼠标事件 -->
        <primitive v-if="mesh" :object="mesh">
            <!-- BoxHelper 依然保留，作为视觉辅助线 -->
            <Helper :type="BoxHelper" :args="[mesh, 'royalblue']" />
        </primitive>

        <!-- -------------------------------------------------------- -->
        <!-- 🌟 核心：三个可点击的非透明边框 Mesh (X, Y, Z) -->
        <!-- -------------------------------------------------------- -->
        <!-- Group位置继承自mesh.position，因此内部Mesh坐标是相对mesh中心点的 -->
        <TresGroup v-if="mesh" :position="mesh.position">

            <!-- X-AXIS SELECTION (Width: size.x) -->
            <!-- 将其放置在 Y 和 Z 的正方向边界上，形成一个可见的边 -->
            <TresMesh :position="[0, size.y / 2, size.z / 2]" @click="handleClickSide('x')"
                @pointerenter="handleSideEnter('x')" @pointerleave="handleSideLeave">
                <!-- Geometry: X轴长，Y和Z轴加厚 (0.1) -->
                <TresBoxGeometry :args="[size.x, size.y * 0.1, size.z * 0.1]" />
                <TresMeshBasicMaterial :color="sideHovered === 'x' ? 0xFBB03B : 0xFF0000" :transparent="true"
                    :opacity="sideHovered === 'x' ? 1 : 0.5" />
            </TresMesh>

            <!-- Y-AXIS SELECTION (Height: size.y) -->
            <!-- 将其放置在 X 和 Z 的正方向边界上 -->
            <TresMesh :position="[size.x / 2, 0, size.z / 2]" @click="handleClickSide('y')"
                @pointerenter="handleSideEnter('y')" @pointerleave="handleSideLeave">
                <!-- Geometry: Y轴长，X和Z轴加厚 (0.1) -->
                <TresBoxGeometry :args="[size.x * 0.1, size.y, size.z * 0.1]" />
                <TresMeshBasicMaterial :color="sideHovered === 'y' ? 0xFBB03B : 0x00FF00" :transparent="true"
                    :opacity="sideHovered === 'y' ? 1 : 0.5" />
            </TresMesh>

            <!-- Z-AXIS SELECTION (Depth: size.z) -->
            <!-- 将其放置在 X 和 Y 的正方向边界上 -->
            <TresMesh :position="[size.x / 2, size.y / 2, 0]" @click="handleClickSide('z')"
                @pointerenter="handleSideEnter('z')" @pointerleave="handleSideLeave">
                <!-- Geometry: Z轴长，X和Y轴加厚 (0.1) -->
                <TresBoxGeometry :args="[size.x * 0.1, size.y * 0.1, size.z]" />
                <TresMeshBasicMaterial :color="sideHovered === 'z' ? 0xFBB03B : 0x0000FF" :transparent="true"
                    :opacity="sideHovered === 'z' ? 1 : 0.5" />
            </TresMesh>
        </TresGroup>
    </TresCanvas>
</template>

<script setup lang="ts">
import { BasicShadowMap, SRGBColorSpace, ACESFilmicToneMapping, Mesh, Material, MeshBasicMaterial, BoxHelper, PointLightHelper, Box3, Vector3 } from 'three';
import { Helper, OrbitControls } from '@tresjs/cientos'
import { VertexNormalsHelper } from 'three-stdlib'
import { computed, markRaw, onMounted, ref, watch } from 'vue';
import { usePropertiesPanelStore } from '@/stores/properties-panle';
import { TresCanvas } from '@tresjs/core'

const propertiesPanelStore = usePropertiesPanelStore()

const sideModel = defineModel()

const props = defineProps({
    mesh: Object
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


// 记录哪个轴正在被悬停（用于高亮）
const sideHovered = ref<'x' | 'y' | 'z' | null>(null);

// 计算 Mesh 的边界尺寸 (X, Y, Z)
const size = computed(() => {
    if (!props.mesh) return { x: 0, y: 0, z: 0 };

    // 创建一个临时的 Box3 实例
    const box = new Box3();
    // 使用 Mesh 的对象计算其边界框
    box.setFromObject(props.mesh as Mesh);

    // 创建一个 Vector3 实例来存储尺寸
    const dimensions = new Vector3();
    box.getSize(dimensions);

    // 返回 Mesh 的原始尺寸 
    return {
        x: dimensions.x, // width
        y: dimensions.y, // height
        z: dimensions.z, // depth
    };
});

// ----------------------------------------------------
// 🌟 交互逻辑 (只处理边框)
// ----------------------------------------------------

/**
 * 处理边框 Mesh 点击事件
 * @param side 用户选择的轴 'x', 'y', 'z'
 */
function handleClickSide(side: 'x' | 'y' | 'z') {
    if (!props.mesh) return;

    // 1. 设置 sideModel (v-model) 为用户选择的轴
    sideModel.value = side;

    // 2. 打印基准值，用于调试和确认
    const baseValue = size.value[side];
    console.log(`用户选择了 ${side.toUpperCase()} 轴作为基准，尺寸: ${baseValue.toFixed(3)}`);

    // TODO: 通知父组件（或 Store）进入“设定变量名”步骤
}

/**
 * 处理边框 Mesh 鼠标进入事件 (高亮)
 */
function handleSideEnter(side: 'x' | 'y' | 'z') {
    sideHovered.value = side;
}

/**
 * 处理边框 Mesh 鼠标离开事件 (取消高亮)
 */
function handleSideLeave() {
    sideHovered.value = null;
}

</script>

<style scoped></style>