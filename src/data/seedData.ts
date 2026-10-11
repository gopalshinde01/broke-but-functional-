import { FinanceState } from '../types/finance';

export const INITIAL_BLANK_STATE: FinanceState = {
  budget: 10000,
  income: 0,
  reserve: 1500,
  day: 1, // Day 1 of 30
  expenses: [],
  subs: [],
  goals: [
    {
      id: 'goal-initial',
      name: 'Emergency Buffer',
      target: 2000,
      saved: 0,
    },
  ],
};

export const DEMO_MONTH_STATE: FinanceState = {
  budget: 10000,
  income: 0,
  reserve: 1500,
  day: 10, // Day 10 of 30
  expenses: [
    {
      id: 'exp-1',
      name: 'Mess + canteen',
      cat: 'Food',
      amt: 900,
      day: 2,
      createdAt: 1710000000000,
    },
    {
      id: 'exp-2',
      name: 'Metro pass',
      cat: 'Travel',
      amt: 450,
      day: 3,
      createdAt: 1710086400000,
    },
    {
      id: 'exp-3',
      name: 'Phone recharge',
      cat: 'Bills',
      amt: 299,
      day: 4,
      createdAt: 1710172800000,
    },
    {
      id: 'exp-4',
      name: 'T-shirt',
      cat: 'Shopping',
      amt: 499,
      day: 5,
      createdAt: 1710259200000,
    },
    {
      id: 'exp-5',
      name: 'Movie',
      cat: 'Entertainment',
      amt: 250,
      day: 6,
      createdAt: 1710345600000,
    },
    {
      id: 'exp-6',
      name: 'Snacks',
      cat: 'Food',
      amt: 400,
      day: 7,
      createdAt: 1710432000000,
    },
    {
      id: 'exp-7',
      name: 'Stationery',
      cat: 'Other',
      amt: 160,
      day: 8,
      createdAt: 1710518400000,
    },
    {
      id: 'exp-8',
      name: 'Lunch out',
      cat: 'Food',
      amt: 320,
      day: 9,
      createdAt: 1710604800000,
    },
    {
      id: 'exp-9',
      name: 'Auto Travel',
      cat: 'Travel',
      amt: 180,
      day: 9,
      createdAt: 1710604850000,
    },
  ],
  subs: [
    { id: 'sub-1', name: 'Music', amt: 119, active: true },
    { id: 'sub-2', name: 'Video streaming', amt: 299, active: true },
    { id: 'sub-3', name: 'Gaming pass', amt: 149, active: true },
  ],
  goals: [
    {
      id: 'goal-1',
      name: 'New headphones',
      target: 2000,
      saved: 400,
    },
  ],
};
