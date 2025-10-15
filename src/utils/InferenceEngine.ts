import { Mesh, Box3, Vector3 } from "three";
import {
  type CustomVariable,
  type VariableBinding,
} from "@/stores/variableStore";
import type { SideData } from "@/types/mesh";

// 设定一个极小的容差值，因为浮点数计算不精确
const TOLERANCE = 0.001;

/**
 * 计算 Mesh 在世界坐标系下的真实尺寸
 * @param mesh THREE.Mesh 对象
 * @returns {x, y, z} 尺寸对象
 */
function getMeshWorldSize(mesh: Mesh): { x: number; y: number; z: number } {
  const box = new Box3().setFromObject(mesh);
  const dimensions = new Vector3();
  box.getSize(dimensions);
  return {
    x: dimensions.x, // width
    y: dimensions.y, // height
    z: dimensions.z, // depth
  };
}

/**
 * 🌟 核心逻辑：全局匹配所有尺寸相同的 Mesh 边，并生成绑定列表
 * @param sourceSide 步骤 2 选中的基准边数据
 * @param allMeshes 场景中所有 Mesh 的列表
 * @returns 匹配到的 VariableBinding 列表
 */
export function findAndBindMeshes(
  sourceSide: SideData,
  allMeshes: Mesh[]
): VariableBinding[] {
  const sourceValue = sourceSide.value; // 基准尺寸
  const sourceAxis = sourceSide.axis; // 基准轴向

  const bindings: VariableBinding[] = [];
  
  // 遍历场景中的每一个 Mesh
  for (const mesh of allMeshes) {
    // 排除非 Mesh 对象
    if (!mesh.isMesh) continue;

    // 排除源 Mesh (我们会在循环结束后单独添加它)
    if (mesh.name === sourceSide.mesh.name) continue;

    // 💡 确保 Mesh 有一个名字，否则无法稳定识别
    if (!mesh.name) {
      console.warn(
        `[InferenceEngine] Mesh ${mesh.uuid} 没有名字，跳过自动绑定。`
      );
      continue;
    }

    const size = getMeshWorldSize(mesh); // 🌟 匹配逻辑： // 1. 匹配 Mesh 的 X 轴

    if (sourceAxis === "x" && Math.abs(size.x - sourceValue) < TOLERANCE) {
      // 🌟 核心修改：使用 mesh.name
      bindings.push({ meshName: mesh.name, axis: "x", initialValue: size.x });
      continue;
    } // 2. 匹配 Mesh 的 Y 轴

    if (sourceAxis === "y" && Math.abs(size.y - sourceValue) < TOLERANCE) {
      // 🌟 核心修改：使用 mesh.name
      bindings.push({ meshName: mesh.name, axis: "y", initialValue: size.y });
      continue;
    } // 3. 匹配 Mesh 的 Z 轴

    if (sourceAxis === "z" && Math.abs(size.z - sourceValue) < TOLERANCE) {
      // 🌟 核心修改：使用 mesh.name
      bindings.push({ meshName: mesh.name, axis: "z", initialValue: size.z });
      continue;
    }
  }

  // 🌟 将最初选中的 Mesh 作为第一个绑定项 (确保它的 Mesh.name 存在)
  if (sourceSide.mesh.name) {
    const sourceSize = getMeshWorldSize(sourceSide.mesh);
    bindings.unshift({
      meshName: sourceSide.mesh.name, // 🌟 核心修改：使用 mesh.name
      axis: sourceAxis,
      initialValue: sourceSize[sourceAxis],
    });
  } else {
    console.error(
      "[InferenceEngine] 警告：源 Mesh 没有名字，无法稳定绑定！请为 Mesh 命名。"
    );
  }

  console.log(`[InferenceEngine] 找到 ${bindings.length} 个匹配项并生成绑定。`);
  return bindings;
}
