import type { SideData } from "@/types/mesh";
import { defineStore } from "pinia";
import type { Mesh } from "three";

// 🌟 新增：描述一个被绑定到该变量的 Mesh 边
export interface VariableBinding {
  meshName: string;
  axis: "x" | "y" | "z";
  initialValue: number; // 该 Mesh 在绑定时的原始尺寸
}

export interface CustomVariable {
  name: string;
  value: string; // 用户的输入，可能是数字或表达式
  // 保持以下属性，用于记录最初选择的Mesh和轴向
  sourceMeshName: string;
  sourceAxis: SideData["axis"];
  sourceInitialValue: number;

  description: string;

  // 🌟 核心变化：移除 scaleFactor，新增 bindings 列表
  bindings: VariableBinding[];
}

export const useVariableStore = defineStore("variableStore", {
  state: () => ({
    // 存储所有自定义的变量列表
    variables: [] as CustomVariable[],
  }),

  actions: {
    /**
     * 存储一个新的自定义变量到全局列表
     * @param variable 完整的变量对象
     */
    addVariable(variable: CustomVariable) {
      // 检查是否已存在同名变量
      const existingIndex = this.variables.findIndex(
        (v) => v.name === variable.name
      );

      if (existingIndex !== -1) {
        // 如果存在，则更新
        this.variables[existingIndex] = variable;
        console.log(`[VariableStore] 变量 ${variable.name} 已更新.`);
      } else {
        // 如果不存在，则添加
        this.variables.push(variable);
        console.log(`[VariableStore] 变量 ${variable.name} 已添加.`);
      }
    },

    /**
     * 移除一个变量 (如果需要撤销操作)
     * @param name 变量名称
     */
    removeVariable(name: string) {
      this.variables = this.variables.filter((v) => v.name !== name);
      console.log(`[VariableStore] 变量 ${name} 已移除.`);
    },
  },

  getters: {
    /**
     * 获取所有变量的映射 (便于通过名称快速查找值)
     */
    variableMap: (state) => {
      return state.variables.reduce((map, variable) => {
        // 这里只存储名称和值，用于后续表达式解析
        map[variable.name] = variable.value;
        return map;
      }, {} as { [key: string]: string });
    },
  },
});
