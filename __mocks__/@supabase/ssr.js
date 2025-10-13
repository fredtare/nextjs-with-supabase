// __mocks__/@supabase/ssr.js
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
  })),
  auth: {
    getClaims: jest.fn(),
  },
};

export const createServerClient = jest.fn(() => mockSupabase);