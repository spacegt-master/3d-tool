<template>
    <v-navigation-drawer permanent location="end" rounded="s-lg" :width="450" style="z-index:2500;">
        <v-list-item class="py-4">
            <template #title>
                <div class="text-h6">
                    Parametric modeling
                </div>
            </template>
            <template #subtitle>
                It makes modeling no longer a fixed and one-off result, but a flexible and modifiable "recipe". You can
                adjust any parameter in the "formula" at any time (such as length, radius, or Angle), and the model will
                automatically change according to the rules you set, without having to start from scratch to re-model.
            </template>
        </v-list-item>

        <v-divider />

        <div class="pa-4">
            <div class="d-flex">
                <div>
                    <strong>Import from FBX</strong>

                    <p class="text-body-2 text-medium-emphasis py-1">
                        hi! Please upload your.fbx model file. We only support the FBX format!
                    </p>
                </div>
            </div>

            <v-file-upload v-if="!propertiesPanelStore.raw" v-model="propertiesPanelStore.raw"
                accept=".fbx"></v-file-upload>

            <v-list v-else bg-color="background" class="py-0" item-props lines="two" rounded="lg">
                <v-list-item link :subtitle="propertiesPanelStore.raw.name" :title="propertiesPanelStore.raw.name">
                    <template #prepend>
                        <v-avatar class="pa-7" color="surface-light" rounded="lg" size="50">
                            <v-avatar color="info" icon="mdi-pencil-ruler" rounded>
                                <v-icon color="white" />
                            </v-avatar>
                        </v-avatar>
                    </template>
                    <template #append>
                        <v-btn class="ml-2" icon="mdi-delete" variant="text" @click="propertiesPanelStore.raw = null" />
                    </template>
                </v-list-item>
            </v-list>

            <div v-if="propertiesPanelStore.raw">
                <v-divider />

                <strong style="line-height: 50px;">Variable</strong>

                <v-number-input v-model="propertiesPanelStore.width" controlVariant="stacked" label="Width (mm)" :min="1"
                    :step="1"></v-number-input>
                <v-number-input v-model="propertiesPanelStore.height" controlVariant="stacked" label="Height (mm)" :min="1"
                    :step="1"></v-number-input>
                <v-number-input v-model="propertiesPanelStore.deep" controlVariant="stacked" label="Deep (mm)" :min="1"
                    :step="1"></v-number-input>

                <v-checkbox v-model="propertiesPanelStore.panelThicknessUnification" hide-details
                    label="Uniform thickness of the panel"></v-checkbox>

                <v-number-input v-model="propertiesPanelStore.panelThickness"
                    :disabled="!propertiesPanelStore.panelThicknessUnification" controlVariant="stacked"
                    label="PanelThickness (mm)" :min="1"></v-number-input>
            </div>

            <div v-if="!propertiesPanelStore.raw">
                <strong style="line-height: 50px;">Tolerance threshold</strong>

                <v-slider v-model="propertiesPanelStore.threshold" :min="0" :max="0.075"
                    :ticks="{ '0': 'Close', '0.025': 'High', '0.05': 'Medium', '0.075': 'Low' }" show-ticks="always"
                    step="0.025" tick-size="4"></v-slider>
            </div>
            <div v-if="propertiesPanelStore.raw">
                <strong style="line-height: 50px;">Mesh Formula</strong>

                <v-expansion-panels class="mb-6">
                    <v-expansion-panel v-for="(meshData, index) in propertiesPanelStore.meshesData" :key="index">
                        <v-expansion-panel-title expand-icon="mdi-menu-down">
                            <v-icon class="mr-2" icon="mdi-cube-outline"></v-icon>
                            {{ meshData.name }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <strong style="line-height: 50px;">Position</strong>

                            <v-textarea v-model="meshData.formula.position.x" rows="1"
                                :label="`x: ${Math.trunc(meshData.mesh.position.x * 10)}`"
                                variant="solo-filled"></v-textarea>

                            <v-textarea v-model="meshData.formula.position.y" rows="1"
                                :label="`y: ${Math.trunc(meshData.mesh.position.y)}`" variant="solo-filled"></v-textarea>

                            <v-textarea v-model="meshData.formula.position.z" rows="1"
                                :label="`z: ${Math.trunc(meshData.mesh.position.z)}`" variant="solo-filled"></v-textarea>

                            <strong style="line-height: 50px;">Size</strong>

                            <v-textarea v-model="meshData.formula.scale.x" rows="1"
                                :label="`Width: ${Math.trunc(meshData.mesh.scale.x)}`" variant="solo-filled"></v-textarea>

                            <v-textarea v-model="meshData.formula.scale.y" rows="1"
                                :label="`Height: ${Math.trunc(meshData.mesh.scale.y)}`" variant="solo-filled"></v-textarea>

                            <v-textarea v-model="meshData.formula.scale.z" rows="1"
                                :label="`Deep: ${Math.trunc(meshData.mesh.scale.z)}`" variant="solo-filled"></v-textarea>

                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>
        </div>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { MeshData, usePropertiesPanelStore } from '@/stores/properties-panle.ts'

const propertiesPanelStore = usePropertiesPanelStore()


function getSizeLabel(meshData: MeshData, axis: string) {
    if (meshData.thicknessAxis == 'x') {
        switch (axis) {
            case 'x':
                return 'PanelThickness'
            case 'y':
                return 'Height'
            case 'z':
                return 'Width'
        }
    } else if (meshData.thicknessAxis == 'y') {
        switch (axis) {
            case 'x':
                return 'Width'
            case 'y':
                return 'PanelThickness'
            case 'z':
                return 'Height'
        }
    } else if (meshData.thicknessAxis == 'z') {
        switch (axis) {
            case 'x':
                return 'Width'
            case 'y':
                return 'Height'
            case 'z':
                return 'PanelThickness'
        }
    }
}

function reset(meshData: MeshData) {
    meshData.mesh.position.x = meshData.originalPosition.x
    meshData.mesh.position.y = meshData.originalPosition.y
    meshData.mesh.position.z = meshData.originalPosition.z

    meshData.mesh.scale.x = meshData.originalSize.x
    meshData.mesh.scale.y = meshData.originalSize.y
    meshData.mesh.scale.z = meshData.originalSize.z
}
</script>

<style scoped></style>