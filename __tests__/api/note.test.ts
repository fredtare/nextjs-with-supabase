// __tests__/api/note.test.ts
import { createClient } from '@/lib/supabase/server';
import { POST, GET, PATCH, DELETE } from '../nextjs-with-supabase/app/notes';
import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock Supabase client
const mockSupabase = require('@supabase/ssr');

describe('Notes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/note', () => {
    it('should create a new note and return it', async () => {
      const request = new NextRequest('http://localhost:3000/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'New test note' }),
      });

      mockSupabase.from().insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: '456e7890-e12f-45b6-a789-426614174001',
              content: 'New test note',
              created_at: '2025-10-13T16:00:00+03:00',
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
        content: 'New test note',
        created_at: '2025-10-13T16:00:00+03:00',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('notes');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([{ content: 'New test note' }]);
    });

    it('should return 400 for empty content', async () => {
      const request = new NextRequest('http://localhost:3000/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Note cannot be empty' });
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{content: "Test"}', // Invalid JSON
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Invalid request body' });
    });
  });

  describe('GET /api/note', () => {
    it('should return all notes', async () => {
      mockSupabase.from().select.mockReturnValue({
        order: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                content: 'test',
                created_at: '2025-10-13T15:58:00+03:00',
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
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'test',
          created_at: '2025-10-13T15:58:00+03:00',
        },
      ]);
      expect(mockSupabase.from).toHaveBeenCalledWith('notes');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
    });

    it('should return empty array if no notes', async () => {
      mockSupabase.from().select.mockReturnValue({
        order: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([]);
    });
  });

  describe('PATCH /api/note/[id]', () => {
    it('should update a note and return it', async () => {
      const request = new NextRequest('http://localhost:3000/api/note/123e4567-e89b-12d3-a456-426614174000', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated test note' }),
      });

      mockSupabase.from().update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                content: 'Updated test note',
                created_at: '2025-10-13T15:58:00+03:00',
              },
              error: null,
            }),
          }),
        }),
      });

      const response = await PATCH(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Updated test note',
        created_at: '2025-10-13T15:58:00+03:00',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('notes');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ content: 'Updated test note' });
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return 400 for empty content', async () => {
      const request = new NextRequest('http://localhost:3000/api/note/123e4567-e89b-12d3-a456-426614174000', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }),
      });

      const response = await PATCH(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Content is required and must be a non-empty string' });
    });
  });

  describe('DELETE /api/note/[id]', () => {
    it('should delete a note and return success message', async () => {
      const request = new NextRequest('http://localhost:3000/api/note/123e4567-e89b-12d3-a456-426614174000', {
        method: 'DELETE',
      });

      mockSupabase.from().delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const response = await DELETE(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ message: 'Note deleted' });
      expect(mockSupabase.from).toHaveBeenCalledWith('notes');
      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return 500 for invalid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/note/99999999-9999-9999-9999-999999999999', {
        method: 'DELETE',
      });

      mockSupabase.from().delete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'No rows found' } }),
      });

      const response = await DELETE(request, { params: { id: '99999999-9999-9999-9999-999999999999' } });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json).toEqual({ error: 'Failed to delete note: No rows found' });
    });
  });
});