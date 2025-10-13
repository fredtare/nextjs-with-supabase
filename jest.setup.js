// jest.setup.js
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for Node.js (used by Supabase)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;