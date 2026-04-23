/**
 * 动作层（最小教学版）
 * 每个函数只做一件事，方便你从 0 学 Mineflayer。
 */

async function listInventory(bot) {
  const items = bot.inventory.items().map((item) => ({
    name: item.name,
    count: item.count,
  }));

  return {
    success: true,
    message: items.length ? `背包内有 ${items.length} 种物品` : '背包为空',
    items,
  };
}

async function scanNearby(bot, args = {}) {
  const { blockName, radius = 16, count = 3 } = args;
  if (!blockName) {
    return { success: false, message: '缺少参数: blockName' };
  }

  const positions = bot.findBlocks({
    matching: (block) => block?.name === blockName,
    maxDistance: radius,
    count,
  });

  return {
    success: true,
    message: positions.length ? `找到 ${positions.length} 个 ${blockName}` : `附近没有 ${blockName}`,
    blocks: positions.map((p) => ({ x: p.x, y: p.y, z: p.z })),
  };
}

async function chat(bot, args = {}) {
  const text = args.message || '...';
  bot.chat(text);
  return { success: true, message: '已发送聊天消息' };
}

async function smeltItem(_bot, args = {}) {
  return {
    success: false,
    message: `TODO: 自己实现 smeltItem，当前参数 ${JSON.stringify(args)}`,
  };
}

async function executeAction(bot, toolName, args = {}) {
  try {
    switch (toolName) {
      case 'listInventory':
        return await listInventory(bot);
      case 'scanNearby':
        return await scanNearby(bot, args);
      case 'chat':
        return await chat(bot, args);
      case 'smeltItem':
        return await smeltItem(bot, args);
      default:
        return { success: false, message: `未知动作: ${toolName}` };
    }
  } catch (error) {
    return { success: false, message: `动作执行失败: ${error.message}` };
  }
}

module.exports = {
  executeAction,
  listInventory,
  scanNearby,
  chat,
  smeltItem,
};

