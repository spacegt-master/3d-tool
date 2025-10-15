<template>
    <div class="p-6 h-full flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-6 text-gray-700">系统推理与全局绑定 (步骤 4)</h2>

        <div class="flex-grow overflow-y-auto">
            <v-alert type="success" icon="mdi-check-decagram" density="compact" class="mb-6" variant="tonal">
                变量 **{{ variable.name }}** 定义成功。系统已执行 **全局尺寸匹配**。
            </v-alert>

            <!-- 变量定义概览 -->
            <v-card class="mb-6" variant="outlined">
                <v-card-title class="text-h6 font-weight-medium text-blue-grey-darken-2">
                    <v-icon icon="mdi-ruler-square" class="mr-2" color="blue-grey"></v-icon>
                    变量详情
                </v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-list-item density="compact">
                                <v-list-item-title class="font-weight-bold">目标变量名</v-list-item-title>
                                <v-list-item-subtitle class="text-pink-600 font-weight-bold">{{ variable.name
                                    }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-list-item density="compact">
                                <v-list-item-title class="font-weight-bold">目标值/表达式</v-list-item-title>
                                <v-list-item-subtitle class="text-green-600 font-weight-bold">{{ variable.value
                                    }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-list-item density="compact">
                                <v-list-item-title class="font-weight-bold">原始基准 Mesh 名称</v-list-item-title>
                                <!-- 🌟 更改为显示 Mesh Name -->
                                <v-list-item-subtitle class="font-weight-bold text-blue-600">{{ variable.sourceMeshName
                                    || 'N/A' }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-list-item density="compact">
                                <v-list-item-title class="font-weight-bold">基准尺寸</v-list-item-title>
                                <v-list-item-subtitle>{{ variable.initialValue.toFixed(3) }} ({{
                                    variable.axis.toUpperCase() }}轴)</v-list-item-subtitle>
                            </v-list-item>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 🌟 核心：全局匹配与绑定结果 -->
            <v-card variant="tonal" class="border-green-400 border-2">
                <v-card-title class="text-h6 font-weight-medium text-green-700">
                    <v-icon icon="mdi-link-variant" class="mr-2" color="green-700"></v-icon>
                    全局同步绑定结论
                </v-card-title>
                <v-card-text>
                    <!-- <p class="text-lg mb-3">
                        系统在场景中匹配到 **{{ variable.bindings.length }}** 个拥有相同尺寸（{{ variable.sourceInitialValue.toFixed(3)
                        }}m）的边。
                    </p>

                    <v-alert :type="variable.bindings.length > 1 ? 'info' : 'warning'" density="compact" variant="tonal"
                        class="mb-4">
                        <span v-if="variable.bindings.length > 1">
                            这些 Mesh 的对应轴向已被 **{{ variable.name }}** 变量锁定，实现一改全改。
                        </span>
                        <span v-else>
                            仅匹配到源 Mesh，请确认其他 Mesh 尺寸是否一致或手动添加绑定。
                        </span>
                    </v-alert>

                    <v-expansion-panels flat>
                        <v-expansion-panel title="查看绑定列表 (Mesh 名称)" :text="variable.bindings.map(b =>
                            // 🌟 更改为显示 Mesh Name
                            `- Mesh Name: ${b.meshName} (${b.axis.toUpperCase()} 轴, 初始值: ${b.initialValue.toFixed(3)}m)`
                        ).join('\n')">
                        </v-expansion-panel>
                    </v-expansion-panels> -->
                </v-card-text>
            </v-card>
        </div>

        <!-- 完成操作 -->
        <v-btn color="success" @click="$emit('close-dialog')" class="mt-8" size="large" width="100%">
            完成自定义变量设置并激活约束
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import type { Mesh } from 'three';
// 🌟 引入 VariableBinding 类型，用于构造 CustomVariable 接口
import { type VariableBinding } from '@/stores/variableStore';
import type { SideData } from '@/types/mesh';

// 定义 Variable 的类型，基于 variableStore.ts 的最新结构
export interface CustomVariable {
    name: string;
    value: string;
    sourceMeshName: string;
    sourceAxis: SideData['axis'];
    sourceInitialValue: number;
    description: string;
    bindings: VariableBinding[];
}

const props = defineProps<{
    mesh: Mesh | undefined, // Mesh 对象，用于显示其 UUID
    variable: CustomVariable // 步骤 3 定义的变量结果
}>();

// 定义一个 emit，用于通知父组件关闭对话框
defineEmits(['close-dialog']);

</script>

<style scoped>
/* 确保组件充满容器并使用 flex 布局 */
.p-6 {
    padding: 1.5rem;
}
</style>
