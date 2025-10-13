import { defineStore } from "pinia";
import { ref } from "vue";
import { Pane } from "tweakpane";
import { useModelStore } from "./model";

export const useTweakpaneStore = defineStore("tweakpane", () => {
  const modelStore = useModelStore();

  const pane = ref<Pane>();

  // Reactive properties that will be controlled by Tweakpane
  const controls = ref({
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    color: "#ff6b6b",
    wireframe: false,
    material: "basic",
  });

  function init(paneContainer?: HTMLElement) {
    if (!paneContainer) return;

    // 确保每次调用 init() 时，只有一个活跃的面板。
    dispose();
    console.log(modelStore.selectedData)

    // Create Tweakpane instance with container
    pane.value = new Pane({
      title:`${modelStore.selectedData.name} Controls`,
      container: paneContainer,
    });

    // Add position controls
    const positionFolder = pane.value.addFolder({ title: "Position" });
    positionFolder.addBinding(controls.value, "positionX", {
      min: -3,
      max: 3,
      step: 0.1,
    });
    positionFolder.addBinding(controls.value, "positionY", {
      min: -3,
      max: 3,
      step: 0.1,
    });
    positionFolder.addBinding(controls.value, "positionZ", {
      min: -3,
      max: 3,
      step: 0.1,
    });

    // Add rotation controls
    const rotationFolder = pane.value.addFolder({ title: "Rotation" });
    rotationFolder.addBinding(controls.value, "rotationX", {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    });
    rotationFolder.addBinding(controls.value, "rotationY", {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    });
    rotationFolder.addBinding(controls.value, "rotationZ", {
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    });

    // Add material controls
    const materialFolder = pane.value.addFolder({ title: "Material" });
    materialFolder.addBinding(controls.value, "scale", {
      min: 0.1,
      max: 3,
      step: 0.1,
    });
    materialFolder.addBinding(controls.value, "color");
    materialFolder.addBinding(controls.value, "wireframe");
    materialFolder.addBinding(controls.value, "material", {
      options: {
        Basic: "basic",
        Normal: "normal",
        Standard: "standard",
      },
    });

    // Add reset button
    pane.value.addButton({ title: "Reset All" }).on("click", () => {
      Object.assign(controls.value, {
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        scale: 1,
        color: "#ff6b6b",
        wireframe: false,
        material: "basic",
      });
    });
  }

  function dispose() {
    if (pane.value) {
      pane.value.dispose();
    }
  }
  return {
    pane,
    init,
    dispose,
  };
});
