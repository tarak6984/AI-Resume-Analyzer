import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Puter.js
(global as any).window = {
  ...global.window,
  puter: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ uuid: 'test-user', username: 'testuser' }),
      isSignedIn: vi.fn().mockResolvedValue(true),
      signIn: vi.fn().mockResolvedValue(void 0),
      signOut: vi.fn().mockResolvedValue(void 0),
    },
    fs: {
      write: vi.fn().mockResolvedValue({ path: '/test/path' }),
      read: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' })),
      upload: vi.fn().mockResolvedValue({ path: '/test/upload' }),
      delete: vi.fn().mockResolvedValue(void 0),
      readdir: vi.fn().mockResolvedValue([]),
    },
    ai: {
      chat: vi.fn().mockResolvedValue({
        message: { content: '{"overallScore": 85}' }
      }),
      feedback: vi.fn().mockResolvedValue({
        message: { content: '{"overallScore": 85}' }
      }),
      img2txt: vi.fn().mockResolvedValue('test text'),
    },
    kv: {
      get: vi.fn().mockResolvedValue('{"id": "test"}'),
      set: vi.fn().mockResolvedValue(true),
      delete: vi.fn().mockResolvedValue(true),
      list: vi.fn().mockResolvedValue([]),
      flush: vi.fn().mockResolvedValue(true),
    },
  },
};