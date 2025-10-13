import { defineStore } from "pinia";
import type { Object3D, Vector3, Mesh } from "three";
import { reactive, ref } from "vue";

// 存储单个 Mesh 的数据
export class MeshData {
  name: string;
  mesh: any;
  originalPosition: any;
  originalSize: any;
  thicknessAxis: "x" | "y" | "z";
  formula: {
    position: {
      x: string;
      y: string;
      z: string;
    };
    scale: {
      x: string;
      y: string;
      z: string;
    };
  };

  constructor(
    name: string,
    mesh: any,
    originalPosition: any,
    originalSize: any,
    thicknessAxis: "x" | "y" | "z"
  ) {
    this.name = name;
    this.mesh = mesh;
    this.originalPosition = originalPosition;
    this.originalSize = originalSize;
    this.thicknessAxis = thicknessAxis;
    this.formula = {
      position: {
        x: "",
        y: "",
        z: "",
      },
      scale: {
        x: "",
        y: "",
        z: "",
      },
    };
  }
}

// 原始文件
const raw = ref();

// 原始文件加载后模型文件
const model = ref();
const modelOriginalSize = ref();

// 模型中的 mash 体积
const meshes = ref<Mesh[]>();

// 模型加载完成的标志
const isModelReady = ref(false);

// 用户输入的总尺寸
const width = ref<number>(0);
const height = ref<number>(0);
const deep = ref<number>(0);

// 固定的木板厚度
const panelThickness = ref<number>(18); // 假设木板厚度为2个单位
const panelThicknessUnification = ref(false);

// 容差阈值，单位是百分比
const threshold = ref(0);

// 存储所有木板 Mesh 的数据
const meshesData = reactive<MeshData[]>([]);

export const usePropertiesPanelStore = defineStore("properties-panle", () => {
  return {
    raw,
    model,
    modelOriginalSize,
    meshes,
    isModelReady,
    width,
    height,
    deep,
    panelThickness,
    panelThicknessUnification,
    threshold,
    meshesData,
  };
});

export function getRawBlobUrl() {
  return URL.createObjectURL(raw.value);
}

export function centimeter2millimeter(value: number | Vector3) {
  if (typeof value === "number") {
    return Math.trunc(value * 10);
  }

  if (typeof value === "object") {
    return {
      x: Math.trunc(value.x * 10),
      y: Math.trunc(value.y * 10),
      z: Math.trunc(value.z * 10),
    };
  }

  // 如果输入类型不匹配，返回原值或者抛出错误
  return value;
}

export function adsorptionFramework(object: Object3D) {
  let isFullWidth =
    object.scale.x >=
    modelOriginalSize.value.x - modelOriginalSize.value.x * threshold.value;

  let isFullHeight =
    object.scale.y >=
    modelOriginalSize.value.y - modelOriginalSize.value.y * threshold.value;

  let isFullDeep =
    object.scale.z >=
    modelOriginalSize.value.z - modelOriginalSize.value.z * threshold.value;

  if (
    (isFullWidth ? 1 : 0) + (isFullHeight ? 1 : 0) + (isFullDeep ? 1 : 0) >
    1
  ) {
    if (isFullWidth) {
      object.scale.x = modelOriginalSize.value.x;
      object.position.x = 0;
    }
    if (isFullHeight) {
      object.scale.y = modelOriginalSize.value.y;
      object.position.y = 0;
    }
    if (isFullDeep) {
      object.scale.z = modelOriginalSize.value.z;
      object.position.z = 0;
    }
  }
}

function discardDecimal(value: number, decimalQuantity: number) {
  return (
    Math.trunc(Math.round(value * 10 ** decimalQuantity)) /
    10 ** decimalQuantity
  );
}

export function calculationFormula(meshData: MeshData) {
  if (meshData.mesh.scale.x == width.value) {
    meshData.formula.scale.x = "#W";
  } else {
    meshData.formula.scale.x = `#W * ${discardDecimal(
      meshData.mesh.scale.x / width.value,
      3
    )}`;
  }
  if (meshData.mesh.scale.y == height.value) {
    meshData.formula.scale.y = "#H";
  } else {
    meshData.formula.scale.y = `#H * ${discardDecimal(
      meshData.mesh.scale.y / height.value,
      3
    )}`;
  }
  if (meshData.mesh.scale.z == deep.value) {
    meshData.formula.scale.z = "#D";
  } else {
    meshData.formula.scale.z = `#D * ${discardDecimal(
      meshData.mesh.scale.z / deep.value,
      3
    )}`;
  }

  meshData.formula.scale[meshData.thicknessAxis] = "#BT";

  if (Math.trunc(meshData.mesh.position.x * 100) == 0) {
    meshData.formula.position.x = "0";
  } else if (meshData.thicknessAxis == "x") {
    const panelThicknessOffset =
      meshData.mesh.position.x < 0
        ? (panelThickness.value / 2) * -1
        : panelThickness.value / 2;

    meshData.formula.position.x = `#W * ${discardDecimal(
      (meshData.mesh.position.x * 10 + panelThicknessOffset) / width.value,
      3
    )} ${meshData.mesh.position.x < 0 ? "+" : "-"} (#BT / 2)`;
  } else {
    meshData.formula.position.x = `#W * ${discardDecimal(
      (meshData.mesh.position.x * 10) / width.value,
      3
    )}`;
  }

  if (Math.trunc(meshData.mesh.position.y * 100) == 0) {
    meshData.formula.position.y = "0";
  } else if (meshData.thicknessAxis == "y") {
    const panelThicknessOffset =
      meshData.mesh.position.y < 0
        ? (panelThickness.value / 2) * -1
        : panelThickness.value / 2;

    meshData.formula.position.y = `#H * ${discardDecimal(
      (meshData.mesh.position.y * 10 + panelThicknessOffset) / height.value,
      3
    )} ${meshData.mesh.position.y < 0 ? "+" : "-"} (#BT / 2)`;
  } else {
    meshData.formula.position.y = `#H * ${discardDecimal(
      (meshData.mesh.position.y * 10) / width.value,
      3
    )}`;
  }

  if (Math.trunc(meshData.mesh.position.z * 100) == 0) {
    meshData.formula.position.z = "0";
  } else if (meshData.thicknessAxis == "z") {
    const panelThicknessOffset =
      meshData.mesh.position.z < 0
        ? (panelThickness.value / 2) * -1
        : panelThickness.value / 2;

    meshData.formula.position.z = `#D * ${discardDecimal(
      (meshData.mesh.position.z * 10 + panelThicknessOffset) / deep.value,
      3
    )} ${meshData.mesh.position.z < 0 ? "+" : "-"} (#BT / 2)`;
  } else {
    meshData.formula.position.z = `#D * ${discardDecimal(
      (meshData.mesh.position.z * 10) / deep.value,
      3
    )}`;
  }
}
