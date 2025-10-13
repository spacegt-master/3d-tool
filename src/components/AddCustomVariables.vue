<template>
    <v-btn prepend-icon="mdi-plus" width="100%">
        自定义变量

        <v-dialog activator="parent" max-width="700">
            <template v-slot:default="{ isActive }">
                <v-card prepend-icon="mdi-picture-in-picture-bottom-right" title="添加自定义变量">
                    <template #text>
                        <tolerance-threshold v-model="tolerance"></tolerance-threshold>
                    </template>

                    <template v-slot:actions>
                        <v-btn class="ml-auto" text="Close" @click="isActive.value = false"></v-btn>
                    </template>
                </v-card>
            </template>
        </v-dialog>
    </v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';


const tolerance = ref(0)
</script>

<style scoped></style>