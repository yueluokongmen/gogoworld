/**
 * Node.js -> Python 决策客户端（教学骨架）
 */

const AI_SERVICE_URL_DEFAULT = 'http://localhost:8000';

function createAIClient(baseUrl = AI_SERVICE_URL_DEFAULT) {
  const url = `${baseUrl}/decide`;

  return {
    async decide(goal, worldState, history) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, world_state: worldState, history }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AI service returned ${response.status}: ${text}`);
      }

      return response.json();
    },
  };
}

module.exports = { createAIClient };
