export interface Book { id: string; name: string; scope: string; ironLaw: string[]; tag: string }

export const BOOKS: Book[] = [
  {
    id: 'core',
    name: 'Core Book',
    scope: 'BTC / ETH / SOL 主流币永续',
    ironLaw: ['高胜率', '稳定正期望', '± controlled', '不追极致盈亏比'],
    tag: 'controlled',
  },
  {
    id: 'event',
    name: 'Event Book',
    scope: '突发新闻 / 上币 / KOL 爆破 / 机制错配',
    ironLaw: ['高盈亏比', '事件驱动', 'asymmetric', 'Probe 先试仓'],
    tag: 'asymmetric',
  },
  {
    id: 'moonshot',
    name: 'Moonshot Book',
    scope: '极端反身性小市值妖币',
    ironLaw: ['归零心态', '单次损失锁死', '不允许向下摊平', '利润滚动', '独立风控'],
    tag: 'right-tail',
  },
];