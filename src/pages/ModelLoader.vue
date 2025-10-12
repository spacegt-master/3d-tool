<template>
    <primitive v-if="model" :object="model" :scale="1.5" />
</template>

<script setup lang="ts">
import { useLoader } from '@tresjs/core'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { usePropertiesPanelStore, getRawBlobUrl } from '@/stores/properties-panle'

const propertiesPanelStore = usePropertiesPanelStore()

const props = defineProps({
    url: {
        type: String,
        required: true
    }
})

const { state: model, isLoading, error } = useLoader(FBXLoader, props.url)

propertiesPanelStore.model = model
</script>

<style scoped></style>