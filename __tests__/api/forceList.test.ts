// __tests__/api/forcelist.test.ts

//kasutatud Groki abi
import { createClient } from '@/lib/supabase/server';
import { POST, GET } from '@/app/api/forcelist/route';
import { PATCH, DELETE } from '@/app/api/forcelist/[id]/route';
import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock Supabase client
const mockSupabase = require('@supabase/ssr');

describe('Forcelist API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/forcelist', () => {
    it('should create a new mech and return it', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Atlas',
          variant: 'AS7-D',
          description: 'Heavy assault mech',
        }),
      });

      mockSupabase.from().insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: '456e7890-e12f-45b6-a789-426614174001',
              name: 'Atlas',
              variant: 'AS7-D',
              description: 'Heavy assault mech',
              created_at: '2025-10-13T16:22:00+03:00',
            },
            error: null,
          }),
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json).toEqual({
        id: '456e7890-e12f-45b6-a789-426614174001',
        name: 'Atlas',
        variant: 'AS7-D',
        description: 'Heavy assault mech',
        created_at: '2025-10-13T16:22:00+03:00',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('mechs');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([
        { name: 'Atlas', variant: 'AS7-D', description: 'Heavy assault mech' },
      ]);
    });

    it('should return 400 for missing fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', variant: 'AS7-D', description: 'Heavy assault mech' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'All fields are required and must be non-empty' });
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{name: "Atlas"}', // Invalid JSON
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/forcelist', () => {
    it('should return empty array for empty mechs table', async () => {
      mockSupabase.from().select.mockReturnValue({
        order: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith('mechs');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
    });

    it('should return all mechs', async () => {
      mockSupabase.from().select.mockReturnValue({
        order: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [
              {
                id: '456e7890-e12f-45b6-a789-426614174001',
                name: 'Atlas',
                variant: 'AS7-D',
                description: 'Heavy assault mech',
                created_at: '2025-10-13T16:22:00+03:00',
              },
            ],
            error: null,
          }),
        }),
      });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([
        {
          id: '456e7890-e12f-45b6-a789-426614174001',
          name: 'Atlas',
          variant: 'AS7-D',
          description: 'Heavy assault mech',
          created_at: '2025-10-13T16:22:00+03:00',
        },
      ]);
    });
  });

  describe('PATCH /api/forcelist/[id]', () => {
    it('should update all fields and return updated mech', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist/456e7890-e12f-45b6-a789-426614174001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hunchback',
          variant: 'HBK-4G',
          description: 'Medium mech with autocannon',
        }),
      });

      mockSupabase.from().update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '456e7890-e12f-45b6-a789-426614174001',
                name: 'Hunchback',
                variant: 'HBK-4G',
                description: 'Medium mech with autocannon',
                created_at: '2025-10-13T16:22:00+03:00',
              },
              error: null,
            }),
          }),
        }),
      });

      const response = await PATCH(request, { params: { id: '456e7890-e12f-45b6-a789-426614174001' } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({
        id: '456e7890-e12f-45b6-a789-426614174001',
        name: 'Hunchback',
        variant: 'HBK-4G',
        description: 'Medium mech with autocannon',
        created_at: '2025-10-13T16:22:00+03:00',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('mechs');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        name: 'Hunchback',
        variant: 'HBK-4G',
        description: 'Medium mech with autocannon',
      });
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', '456e7890-e12f-45b6-a789-426614174001');
    });

    it('should update only one field', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist/456e7890-e12f-45b6-a789-426614174001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hunchback' }),
      });

      mockSupabase.from().update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '456e7890-e12f-45b6-a789-426614174001',
                name: 'Hunchback',
                variant: 'AS7-D',
                description: 'Heavy assault mech',
                created_at: '2025-10-13T16:22:00+03:00',
              },
              error: null,
            }),
          }),
        }),
      });

      const response = await PATCH(request, { params: { id: '456e7890-e12f-45b6-a789-426614174001' } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({
        id: '456e7890-e12f-45b6-a789-426614174001',
        name: 'Hunchback',
        variant: 'AS7-D',
        description: 'Heavy assault mech',
        created_at: '2025-10-13T16:22:00+03:00',
      });
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ name: 'Hunchback' });
    });

    it('should return 400 for all empty fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist/456e7890-e12f-45b6-a789-426614174001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', variant: '', description: '' }),
      });

      const response = await PATCH(request, { params: { id: '456e7890-e12f-45b6-a789-426614174001' } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'At least one field must be provided' });
    });
  });

  describe('DELETE /api/forcelist/[id]', () => {
    it('should delete a mech and return success message', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist/456e7890-e12f-45b6-a789-426614174001', {
        method: 'DELETE',
      });

      mockSupabase.from().delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const response = await DELETE(request, { params: { id: '456e7890-e12f-45b6-a789-426614174001' } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ message: 'Entry deleted successfully' });
      expect(mockSupabase.from).toHaveBeenCalledWith('mechs');
      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith('id', '456e7890-e12f-45b6-a789-426614174001');
    });

    it('should return 500 for invalid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/forcelist/99999999-9999-9999-9999-999999999999', {
        method: 'DELETE',
      });

      mockSupabase.from().delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'No rows found' } }),
      });

      const response = await DELETE(request, { params: { id: '99999999-9999-9999-9999-999999999999' } });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json).toEqual({ error: 'Failed to delete entry: No rows found' });
    });
  });
});