import { vi } from 'vitest';

// Mock @/lib/supabase — pure function tests never call Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {},
}));

// Mock @/lib/query — pure function tests don't need query keys
vi.mock('@/lib/query', () => ({
  queryKeys: { broadcasts: { detail: (id: string) => ['broadcasts', id] }, suspensions: { active: () => ['suspensions'], today: () => ['suspensions-today'] } },
  staleTimeConfig: { broadcasts: 30000, suspensions: 30000 },
}));

// Mock @/lib/receipts
vi.mock('@/lib/receipts', () => ({
  recordDelivery: vi.fn(),
}));

// Mock expo-router
vi.mock('expo-router', () => ({
  router: { navigate: vi.fn() },
}));

// Mock @react-native-async-storage/async-storage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: vi.fn(),
  useQuery: vi.fn(),
}));

// Mock react (keep createElement for the provider test, but prevent React Native issues)
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return actual;
});
