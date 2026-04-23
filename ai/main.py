"""GoGoWorld AI Service - 教学版最小入口"""

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel, Field

from agent import CookingAgent

app = FastAPI(title="GoGoWorld AI Service (Learning Skeleton)")
agent = CookingAgent()


class DecideRequest(BaseModel):
    goal: str = Field(description="玩家给 NPC 的任务目标")
    world_state: dict = Field(default_factory=dict)
    history: list = Field(default_factory=list)


@app.get("/health")
async def health():
    return {"status": "ok", "mode": "rule-based-agent"}


@app.post("/decide")
async def decide(req: DecideRequest):
    return agent.decide(goal=req.goal, world_state=req.world_state, history=req.history)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
