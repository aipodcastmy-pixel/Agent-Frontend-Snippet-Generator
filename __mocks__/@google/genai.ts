// FIX: Import jest from @jest/globals to make jest.fn available.
import { jest } from '@jest/globals';

export const GoogleGenAI = jest.fn().mockImplementation(() => ({
  models: {
    generateContentStream: jest.fn(),
  },
}));

// Mock enums or other exports if they are used directly in components
export const Type = {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
    NUMBER: 'NUMBER',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
};
