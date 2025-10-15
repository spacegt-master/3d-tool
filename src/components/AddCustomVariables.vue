<template>
    <v-btn prepend-icon="mdi-plus" width="100%">
        自定义变量

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
                            <DefineVariable :sideData="side"></DefineVariable>
                        </v-card>
                    </template>
                </v-stepper>
            </template>
        </v-dialog>
    </v-btn>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePropertiesPanelStore } from '@/stores/properties-panle';

const propertiesPanelStore = usePropertiesPanelStore()

const mesh = ref()

const side = ref()

const step = ref(1)

const items = [
    '选择 Mesh',
    '设定基准',
    '设定变量',
    '系统推理',
]

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

</script>

<style scoped></style>