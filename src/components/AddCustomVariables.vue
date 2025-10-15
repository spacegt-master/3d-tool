<template>
    <v-btn prepend-icon="mdi-plus" width="100%">
        自定义变量

        <v-dialog activator="parent" max-width="800">
            <template v-slot:default="{ isActive }">
                <v-stepper v-model="step" :items="items" show-actions>
                    <template v-slot:item.1>
                        <v-sheet width="100%" height="500px">
                            <select-mesh v-model="mesh" :url="propertiesPanelStore.getRawBlobUrl()"></select-mesh>
                        </v-sheet>
                    </template>

                    <template v-slot:item.2>
                        <v-sheet width="100%" height="500px">
                            <select-mesh-side v-model="side" :mesh="mesh"></select-mesh-side>
                        </v-sheet>
                    </template>

                    <template v-slot:item.3>
                        第三步设置变量
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