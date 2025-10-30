import '@testing-library/jest-dom';
// FIX: Import jest from @jest/globals to make jest.fn available.
import { jest } from '@jest/globals';

// Mock the global html2canvas function, as it's loaded from a CDN
// and not available in the JSDOM test environment.
// This mock returns a promise that resolves to a mock canvas element.
Object.defineProperty(window, 'html2canvas', {
  value: jest.fn().mockImplementation(() => Promise.resolve({
    toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,mocked_base64_string'),
  })),
  writable: true,
});

// Mock clipboard API for tests
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});
