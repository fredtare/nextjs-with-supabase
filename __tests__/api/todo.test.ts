// __tests__/api/todo.test.ts
//kasutatud Groki abi
import { createClient } from '@/lib/supabase/server';
import { POST, GET, PATCH, DELETE } from '@/app/api/todo/route';
import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock Supabase client (reused from Notes app)
const mockSupabase = require('@supabase/ssr');

describe('Todos API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/todo', () => {
    it('should create a new todo and return it', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'Buy groceries', is_complete: false }),
      });

      mockSupabase.from().insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: '456e7890-e12f-45b6-a789-426614174001',
              task: 'Buy groceries',
              is_complete: false,
              created_at: '2025-10-13T16:17:00+03:00',
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
        task: 'Buy groceries',
        is_complete: false,
        created_at: '2025-10-13T16:17:00+03:00',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('todos');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([{ task: 'Buy groceries', is_complete: false }]);
    });

    it('should return 400 for empty task', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: '', is_complete: false }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Task cannot be empty' });
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{task: "Test"}', // Invalid JSON
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Invalid request body' });
    });
  });

  describe('GET /api/todo', () => {
    it('should return empty array for empty todos table', async () => {
      mockSupabase.from().select.mockReturnValue({
        order: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith('todos');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
    });

    it('should return all todos', async () => {
      mockSupabase.from().select.mockReturnValue({
        order: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [
              {
                id: '456e7890-e12f-45b6-a789-426614174001',
                task: 'Buy groceries',
                is_complete: false,
                created_at: '2025-10-13T16:17:00+03:00',
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
          task: 'Buy groceries',
          is_complete: false,
          created_at: '2025-10-13T16:17:00+03:00',
        },
      ]);
    });
  });

  describe('PATCH /api/todo/[id]', () => {
    it('should update task and is_complete and return updated todo', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo/456e7890-e12f-45b6-a789-426614174001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'Buy groceries and milk', is_complete: true }),
      });

      mockSupabase.from().update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '456e7890-e12f-45b6-a789-426614174001',
                task: 'Buy groceries and milk',
                is_complete: true,
                created_at: '2025-10-13T16:17:00+03:00',
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
        task: 'Buy groceries and milk',
        is_complete: true,
        created_at: '2025-10-13T16:17:00+03:00',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('todos');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ task: 'Buy groceries and milk', is_complete: true });
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', '456e7890-e12f-45b6-a789-426614174001');
    });

    it('should update only is_complete', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo/456e7890-e12f-45b6-a789-426614174001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_complete: true }),
      });

      mockSupabase.from().update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '456e7890-e12f-45b6-a789-426614174001',
                task: 'Buy groceries',
                is_complete: true,
                created_at: '2025-10-13T16:17:00+03:00',
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
        task: 'Buy groceries',
        is_complete: true,
        created_at: '2025-10-13T16:17:00+03:00',
      });
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ is_complete: true });
    });

    it('should return 400 for empty task and no is_complete', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo/456e7890-e12f-45b6-a789-426614174001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: '' }),
      });

      const response = await PATCH(request, { params: { id: '456e7890-e12f-45b6-a789-426614174001' } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Task or is_complete must be provided' });
    });
  });

  describe('DELETE /api/todo/[id]', () => {
    it('should delete a todo and return success message', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo/456e7890-e12f-45b6-a789-426614174001', {
        method: 'DELETE',
      });

      mockSupabase.from().delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const response = await DELETE(request, { params: { id: '456e7890-e12f-45b6-a789-426614174001' } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ message: 'Todo deleted' });
      expect(mockSupabase.from).toHaveBeenCalledWith('todos');
      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith('id', '456e7890-e12f-45b6-a789-426614174001');
    });

    it('should return 500 for invalid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/todo/99999999-9999-9999-9999-999999999999', {
        method: 'DELETE',
      });

      mockSupabase.from().delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'No rows found' } }),
      });

      const response = await DELETE(request, { params: { id: '99999999-9999-9999-9999-999999999999' } });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json).toEqual({ error: 'Failed to delete todo: No rows found' });
    });
  });
});