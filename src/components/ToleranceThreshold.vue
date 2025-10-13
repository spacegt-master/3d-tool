<template>
    <div>
        <strong style="line-height: 50px;">容错阈值</strong>

        <v-slider v-model="model" :min="0" :max="0.075"
            :ticks="{ '0': '关闭', '0.025': '2.5% 高精度', '0.05': '5% 普通精度', '0.075': '7.5% 低精度' }" show-ticks="always"
            step="0.025" tick-size="4"></v-slider>
    </div>
</template>

<script setup lang="ts">
const model = defineModel<number>()
</script>

<style scoped></style>