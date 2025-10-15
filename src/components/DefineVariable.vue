<template>

    <div class="p-6 pt-0 h-full flex flex-col justify-between">
        <div v-if="sideData" class="bg-blue-50 p-4 rounded-lg shadow-inner mb-6 ">
            <p class="text-lg font-medium mb-1">基准轴向已选定：
                <span class="text-blue-600 font-extrabold text-2xl ml-2">{{ sideData.axis.toUpperCase() }} </span>
            </p>
            <p class="text-md">测得的原始尺寸：
                <span class="font-mono text-xl text-green-700 font-semibold ml-2">{{ sideData.value.toFixed(3) }}</span>
                cm
            </p>
        </div>

        <!-- 表单区域 -->
        <v-form @submit.prevent="saveVariable">
            <v-text-field v-model="variableName" icon label="变量名称 (推荐使用英文)" placeholder="例如: wall_width, cabinet_height"
                required class="mb-4" variant="outlined" density="comfortable"
                prepend-inner-icon="mdi-variable-box"></v-text-field>

            <v-text-field v-model="variableValue" icon label="变量值/表达式"
                :hint="`初始值为测得的 ${sideData?.axis.toUpperCase()} 轴尺寸。你可以将其改为固定值或简单表达式。`" required class="mb-4"
                variant="outlined" density="comfortable" prepend-inner-icon="mdi-ruler"></v-text-field>

            <v-textarea label="备注 (可选)" v-model="description" rows="2" variant="outlined" density="comfortable"
                placeholder="例如: 厨房地柜宽度，影响排版"></v-textarea>
        </v-form>

        <!-- 确认按钮 -->
        <v-btn color="primary" @click="saveVariable" :disabled="!variableName" class="mt-4" size="large" width="100%">
            确认变量并进入下一步 (系统推理)
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import type { SideData } from '@/types/mesh';
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
    sideData: SideData | undefined
}>();

// 定义一个 emit，用于通知父组件步骤完成
const emit = defineEmits(['variable-defined']);

const variableName = ref('');
const variableValue = ref('');
const description = ref('');

// 在组件挂载时，使用 sideData 的 value 初始化表单
onMounted(() => {
    if (props.sideData) {
        initializeForm(props.sideData);
    }
});

watch(() => props.sideData, (newVal) => {
    if (newVal) {
        initializeForm(newVal);
    }
});

function initializeForm(data: SideData) {
    console.log(data)
    variableValue.value = data.value.toFixed(3);
    // 根据轴向给一个默认名称建议
    if (data.axis === 'x') variableName.value = 'width_var';
    if (data.axis === 'y') variableName.value = 'height_var';
    if (data.axis === 'z') variableName.value = 'depth_var';
}

function saveVariable() {
    if (!variableName.value || !props.sideData) return;

    const newVariable = {
        name: variableName.value,
        value: variableValue.value,
        axis: props.sideData.axis,
        initialValue: props.sideData.value,
        description: description.value,
    };

    console.log('🌟 变量定义完成:', newVariable);

    // 假设变量保存成功，通知父组件可以进入下一步
    emit('variable-defined', newVariable);
}
</script>

<style scoped>
/* 确保组件充满容器并使用 flex 布局 */
.p-6 {
    padding: 1.5rem;
}
</style>