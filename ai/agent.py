"""
教学版 Cooking Agent 决策骨架。

目标：先跑通“感知 -> 自主决策 -> 执行”闭环。
后续你可以在此文件把规则决策替换成 LLM 决策。
"""

from typing import Any

RAW_FOOD_CANDIDATES = {"beef", "porkchop", "chicken", "mutton", "potato", "salmon", "cod"}
FUEL_CANDIDATES = {"coal", "charcoal", "oak_planks", "birch_planks", "spruce_planks", "stick"}


class CookingAgent:
    """最小自主 Agent：基于状态和历史做下一步动作选择。"""

    def decide(self, goal: str, world_state: dict[str, Any], history: list[dict[str, Any]]) -> dict[str, Any]:
        inventory = world_state.get("inventory", [])

        # 第一步：总是先检查背包（环境感知的一部分）
        if not history:
            return self._tool_call("listInventory", {})

        # 提取最近一次工具结果
        last = history[-1]
        last_tool = last.get("tool")
        last_result = last.get("result", {})

        # 从背包状态里提取“原料 + 燃料”
        raw_food = self._find_first_item(inventory, RAW_FOOD_CANDIDATES)
        fuel = self._find_first_item(inventory, FUEL_CANDIDATES) or "coal"

        # 策略：
        # 1) 有原料时，先确保附近有熔炉
        # 2) 有熔炉后执行 smelt
        # 3) 无原料则结束并反馈
        if raw_food:
            if last_tool != "scanNearby":
                return self._tool_call("scanNearby", {"blockName": "furnace", "radius": 24})

            # 刚刚扫过熔炉
            if last_tool == "scanNearby":
                blocks = last_result.get("blocks", [])
                if not blocks:
                    return self._final("我看到你想做烹饪任务，但附近没有熔炉。你可以先放一个熔炉，我再继续。")

                return self._tool_call(
                    "smeltItem",
                    {
                        "itemName": raw_food,
                        "fuel": fuel,
                        "count": 1,
                    },
                )

        # 没有原料：给出自主反馈
        return self._final(
            f"我正在尝试完成目标“{goal}”，但当前背包没有可烹饪原料。请给我生肉或土豆后再试。"
        )

    def _find_first_item(self, inventory: list[dict[str, Any]], candidates: set[str]) -> str | None:
        for item in inventory:
            name = item.get("name")
            if name in candidates and int(item.get("count", 0)) > 0:
                return name
        return None

    def _tool_call(self, tool: str, args: dict[str, Any]) -> dict[str, Any]:
        return {"type": "tool_call", "tool": tool, "args": args}

    def _final(self, content: str) -> dict[str, Any]:
        return {"type": "final_answer", "content": content}
