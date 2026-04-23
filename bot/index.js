const mineflayer = require('mineflayer');
const { executeAction } = require('./actions');

/**
 * 最小可学习版：
 * 1) 连接服务器
 * 2) 通过聊天命令手动控制动作
 * 3) 不接 AI，不读 state（感知层留给你自己实现）
 */

const BOT_USERNAME = process.env.BOT_USERNAME || 'GoGoAgent';
const MC_HOST = process.env.MC_HOST || 'localhost';
const MC_PORT = parseInt(process.env.MC_PORT || '25565', 10);

const bot = mineflayer.createBot({
  host: MC_HOST,
  port: MC_PORT,
  username: BOT_USERNAME,
});

bot.once('spawn', () => {
  console.log(`[Bot] ${BOT_USERNAME} 上线`);
  bot.chat('我已上线。输入 !help 查看命令。');
});

bot.on('chat', (username, message) => {
  if (username === BOT_USERNAME) return;
  if (!message.startsWith('!')) return;

  handleCommand(username, message).catch((error) => {
    console.error('[Command Error]', error);
    bot.chat(`执行失败: ${error.message}`);
  });
});

bot.on('error', (err) => console.error('[Bot Error]', err));
bot.on('kicked', (reason) => console.log('[Bot Kicked]', reason));
bot.on('end', () => console.log('[Bot] 连接断开'));

async function handleCommand(username, raw) {
  const [cmd, ...rest] = raw.slice(1).trim().split(/\s+/);

  if (cmd === 'help') {
    bot.chat('命令: !inv | !scan <blockName> [radius] [count] | !say <text> | !smelt <itemName> [count]');
    return;
  }

  const commandMap = {
    inv: {
      tool: 'listInventory',
      args: {},
    },
    scan: {
      tool: 'scanNearby',
      args: {
        blockName: rest[0],
        radius: rest[1] ? Number(rest[1]) : undefined,
        count: rest[2] ? Number(rest[2]) : undefined,
      },
    },
    say: {
      tool: 'chat',
      args: { message: rest.join(' ') },
    },
    smelt: {
      tool: 'smeltItem',
      args: {
        itemName: rest[0],
        count: rest[1] ? Number(rest[1]) : 1,
      },
    },
  };

  const selected = commandMap[cmd];
  if (!selected) {
    bot.chat(`未知命令: ${cmd}（输入 !help 查看）`);
    return;
  }

  const result = await executeAction(bot, selected.tool, selected.args);
  const ok = result?.success ? '成功' : '失败';
  const msg = result?.message || '无消息';
  bot.chat(`@${username} ${ok}: ${msg}`);
}

process.on('SIGINT', () => {
  bot.chat('下次见。');
  bot.quit();
  process.exit(0);
});

