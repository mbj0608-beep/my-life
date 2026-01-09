
import { Achievement } from './types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_job', name: '步入社会', description: '获得第一份正式工作', unlocked: false },
  { id: 'millionaire', name: '千万豪杰', description: '个人资产达到1000万', unlocked: false },
  { id: 'century', name: '长命百岁', description: '寿命达到100岁', unlocked: false },
  { id: 'home_owner', name: '安居乐业', description: '买下人生第一套房', unlocked: false },
  { id: 'stock_master', name: '股神降世', description: '股票资产超过100万', unlocked: false },
];

export const NAMES_MALE = ['伟', '强', '明', '杰', '龙', '健', '博', '辉', '平', '超'];
export const NAMES_FEMALE = ['敏', '静', '娟', '艳', '丹', '玲', '红', '丽', '萍', '雅'];
export const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];

export const MARKET_HOUSES = [
  { name: '单身公寓', price: 500000, upkeep: 1000, description: '蜗居也是家' },
  { name: '花园洋房', price: 2500000, upkeep: 4000, description: '舒适的中产生活' },
  { name: '大平层', price: 8000000, upkeep: 12000, description: '城市巅峰景观' },
  { name: '海景别墅', price: 30000000, upkeep: 45000, description: '顶奢人生' },
  { name: '私人海岛', price: 200000000, upkeep: 150000, description: '建立自己的王国' },
];

export const MARKET_CARS = [
  { name: '电动单车', price: 3000, upkeep: 50, description: '再也不会堵车' },
  { name: '二手大众', price: 80000, upkeep: 600, description: '遮风挡雨' },
  { name: '特斯拉', price: 300000, upkeep: 1200, description: '智能出行' },
  { name: '保时捷', price: 1200000, upkeep: 5000, description: '名媛入场券' },
  { name: '直升飞机', price: 15000000, upkeep: 80000, description: '拒绝在地上爬' },
];

export const ACTIONS = [
  { id: 'gym', name: '私教健身', cost: 1000, energy: 30, desc: '健康++, 魅力+' },
  { id: 'course', name: 'MBA研修', cost: 5000, energy: 40, desc: '财商++, 智力+' },
  { id: 'social', name: '高端酒会', cost: 3000, energy: 30, desc: '社交++, 魅力+' },
  { id: 'meditate', name: '冥想静修', cost: 200, energy: 20, desc: '快乐++, 毅力+' },
  { id: 'delivery', name: '跑腿送餐', cost: -200, energy: 40, desc: '获得少量金钱, 快乐-' },
];

export const STOCKS = [
  { symbol: 'TECH', name: '玄武科技', price: 100, risk: 0.15 },
  { symbol: 'BEV', name: '茅台白酒', price: 2000, risk: 0.05 },
  { symbol: 'BIO', name: '神农制药', price: 50, risk: 0.1 },
  { symbol: 'COIN', name: '虚拟货币', price: 500, risk: 0.4 },
];
