import { defineStore } from "pinia";
import { ref } from "vue";

export const useModelStore = defineStore("model", () => {
  const selectedData = ref();

  return {
    selectedData,
  };
});
