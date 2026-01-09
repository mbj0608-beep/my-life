
export enum Gender {
  MALE = '男',
  FEMALE = '女'
}

export interface Stats {
  health: number;       // 健康
  intelligence: number; // 智力
  charm: number;        // 魅力
  happiness: number;    // 快乐
  willpower: number;    // 毅力
  finance: number;      // 财商
  social: number;       // 社交
  creativity: number;   // 创造力
  luck: number;         // 幸运
}

export interface Relationship {
  id: string;
  name: string;
  relation: string;
  closeness: number;
  status: string;
  age: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'HOUSE' | 'CAR' | 'ITEM';
  value: number;
  upkeep: number;
}

export interface StockHolding {
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface GameState {
  age: number;
  gender: Gender;
  name: string;
  stats: Stats;
  energy: number;
  money: number;
  job: string;
  education: string;
  history: string[];
  relationships: Relationship[];
  assets: Asset[];
  stocks: StockHolding[];
  achievements: Achievement[];
  isDead: boolean;
  deathReason?: string;
}

export interface GeminiEventResponse {
  title: string;
  description: string;
  options: {
    text: string;
    impactDescription: string;
    statsImpact: Partial<Stats> & { money?: number };
    storyResult: string;
  }[];
}
