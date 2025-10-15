<template>
    <v-btn prepend-icon="mdi-plus" width="100%">
        添加变量

        <v-dialog activator="parent" max-width="800">
            <template v-slot:default="{ isActive }">
                <v-stepper v-model="step" :items="items" hide-actions>
                    <template v-slot:item.1>
                        <v-card title="选择 Mesh" flat>
                            <v-sheet width="100%" height="500px">
                                <select-mesh v-model="mesh" :url="propertiesPanelStore.getRawBlobUrl()"></select-mesh>
                            </v-sheet>
                        </v-card>
                    </template>

                    <template v-slot:item.2>
                        <v-card title="设定基准" flat>
                            <v-sheet width="100%" height="500px">
                                <select-mesh-side v-model="side" :mesh="mesh"></select-mesh-side>
                            </v-sheet>
                        </v-card>
                    </template>

                    <template v-slot:item.3>
                        <v-card title="定义变量" flat>
                            <DefineVariable v-model="variable" :sideData="side"></DefineVariable>
                        </v-card>
                    </template>

                    <template v-slot:item.4>
                        <SystemInference :variable="variable" :mesh="mesh" />
                    </template>
                </v-stepper>
            </template>
        </v-dialog>
    </v-btn>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePropertiesPanelStore } from '@/stores/properties-panle';
import type { Mesh } from 'three';
import { findAndBindMeshes } from '@/utils/InferenceEngine';
import { useVariableStore, type CustomVariable, type VariableBinding } from '@/stores/variableStore';

const propertiesPanelStore = usePropertiesPanelStore()
const variableStore = useVariableStore();

const mesh = ref()
const side = ref()
const variable = ref()

const step = ref(1)

const items = [
    '选择 Mesh',
    '设定基准',
    '设定变量',
    '系统推理',
]

// 💡 假定获取场景中所有 Mesh 的逻辑，你需要根据你的 TresJS 结构实现
// 这是一个占位符，模拟获取场景中的所有 Mesh
// 你可能需要从你的主场景管理 Store 中获取这个列表
function getSceneMeshes(): Mesh[] {
    // 假设你的 propertiesPanelStore 或另一个场景 Store 提供了这个列表
    // 这里我们使用一个占位符，仅包含最初选中的 Mesh
    // 在实际项目中，你需要遍历 THREE.Scene 的 children 来获取所有 Mesh
    return [mesh.value as Mesh];
}


watch(mesh, () => {
    if (mesh.value) {
        step.value = 2
    }
})

watch(side, () => {
    if (mesh.value) {
        step.value = 3
    }
})

watch(variable, () => {
    const newVariable = variable.value;

    if (newVariable && mesh.value && side.value) {
        // 1. 🌟 执行全局匹配和绑定
        // 警告：这里使用了 getSceneMeshes() 的占位符，你需要确保它返回场景中所有 Mesh！
        const allMeshes = getSceneMeshes();
        const bindings: VariableBinding[] = findAndBindMeshes(side.value, allMeshes);

        // 2. 构造完整的 CustomVariable 对象
        const finalVariable: CustomVariable = {
            name: newVariable.name,
            value: newVariable.value,
            description: newVariable.description,

            // 记录最初的来源信息
            sourceMeshName: mesh.value.name, 
            sourceAxis: side.value.axis,
            sourceInitialValue: side.value.value,

            // 存入全局匹配到的绑定列表
            bindings: bindings,
        };

        // 3. 存储到全局 Store
        variableStore.addVariable(finalVariable);

        // 4. 推进到步骤 4 (SystemInference)
        step.value = 4;
    }
})
</script>

<style scoped></style>