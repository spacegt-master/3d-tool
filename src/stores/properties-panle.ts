import { defineStore } from "pinia";
import { ref } from "vue";

export const usePropertiesPanelStore = defineStore("properties-panle", () => {
  // 原始文件
  const raw = ref();

  // 用户输入的总尺寸
  const width = ref<number>(0);
  const height = ref<number>(0);
  const deep = ref<number>(0);

  // 固定的木板厚度
  const panelThickness = ref<number>(18); // 假设木板厚度为2个单位
  const panelThicknessUnification = ref(false);

  // 容差阈值，单位是百分比
  const threshold = ref(0);

  const customVariable = ref([]);

  function getRawBlobUrl() {
    return URL.createObjectURL(raw.value);
  }

  return {
    raw,
    width,
    height,
    deep,
    panelThickness,
    panelThicknessUnification,
    threshold,
    customVariable,
    getRawBlobUrl,
  };
});
