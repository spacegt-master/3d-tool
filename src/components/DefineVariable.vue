<template>

    <div class="pa-4 pt-0 h-full flex flex-col justify-between">
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

const variableModel = defineModel()

const props = defineProps<{
    sideData: SideData | undefined
}>();

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
    variableValue.value = data.value.toFixed(3);
    // 根据轴向给一个默认名称建议
    if (data.axis === 'x') variableName.value = 'width_var';
    if (data.axis === 'y') variableName.value = 'height_var';
    if (data.axis === 'z') variableName.value = 'depth_var';
}
 
function saveVariable() {
    if (!variableName.value || !props.sideData) return;

    // 🌟 1. 尝试将用户输入的值解析为数字
    const initialValue = props.sideData.value;
    const targetValue = parseFloat(variableValue.value);

    // 🌟 2. 检查 targetValue 是否是有效的数字，如果不是，我们只保存文本（表达式）
    let scaleFactor: number | null = null;
    if (!isNaN(targetValue) && initialValue > 0) {
        // 计算缩放比例：目标值 / 原始测得值
        scaleFactor = targetValue / initialValue;
        console.log(`[Scale Calculation] Target: ${targetValue}, Initial: ${initialValue}, Factor: ${scaleFactor}`);
    } else {
        // 如果输入的是表达式，scaleFactor 留空，等待系统推理处理
        console.log(`[Scale Calculation] Value is not a simple number, saving as expression.`);
    }

    const newVariable = {
        name: variableName.value,
        value: variableValue.value, // 用户的原始输入（可能是数字或表达式）
        axis: props.sideData.axis,
        initialValue: initialValue, // 原始测得尺寸
        description: description.value,
        scaleFactor: scaleFactor, // 🌟 新增：如果它是数字，就计算缩放比例
    };

    console.log('🌟 变量定义完成:', newVariable);

    variableModel.value = newVariable
}
</script>