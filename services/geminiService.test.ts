import { generateInitialSnippet, improveSnippet } from './geminiService';
import { GoogleGenAI } from '@google/genai';
// FIX: Import jest globals to fix test runner related errors.
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// The mock is now configured in jest.config.js and implemented in __mocks__/@google/genai.ts
// This is just to satisfy TypeScript's type checker
const MockedGoogleGenAI = GoogleGenAI as jest.Mock;

const mockAiInstance = {
  models: {
    generateContentStream: jest.fn(),
  },
};

MockedGoogleGenAI.mockReturnValue(mockAiInstance);

// Helper to create a mock async iterable stream from a string
async function* createMockStream(fullText: string) {
  // Simulate streaming by breaking the text into small chunks
  for (let i = 0; i < fullText.length; i += 5) {
    yield { text: () => fullText.substring(i, i + 5) };
  }
}

// A version of the stream where text() is used instead of a direct property
async function* createMockStreamWithTextMethod(fullText: string) {
    for (let i = 0; i < fullText.length; i += 5) {
        const textPart = fullText.substring(i, i + 5);
        yield { text: textPart };
    }
}


describe('geminiService', () => {
  beforeEach(() => {
    // Clear mock history before each test
    mockAiInstance.models.generateContentStream.mockClear();
  });

  describe('generateInitialSnippet', () => {
    it('should stream the explanation and return the final code snippet', async () => {
      const mockResponse = {
        html: '<div></div>',
        css: '/**/',
        js: '//',
        explanation: 'This is a simple div.',
      };
      const mockResponseString = JSON.stringify(mockResponse);
      
      mockAiInstance.models.generateContentStream.mockResolvedValue(
        createMockStreamWithTextMethod(mockResponseString)
      );

      const onStream = jest.fn();
      const result = await generateInitialSnippet('a div', onStream);
      
      expect(result).toEqual({
        html: '<div></div>',
        css: '/**/',
        js: '//',
      });
      
      // Verify that the streamed chunks reassemble the full explanation
      const streamedExplanation = onStream.mock.calls.map(call => call[0]).join('');
      expect(streamedExplanation).toBe('This is a simple div.');
      
      expect(mockAiInstance.models.generateContentStream).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid JSON responses gracefully', async () => {
        mockAiInstance.models.generateContentStream.mockResolvedValue(
            createMockStreamWithTextMethod('this is not json')
        );

        const onStream = jest.fn();
        await expect(generateInitialSnippet('a div', onStream)).rejects.toThrow(
            'Invalid JSON response from model.'
        );
    });
  });

  describe('improveSnippet', () => {
    it('should send code, history, and screenshot, then stream and return new code', async () => {
      const mockResponse = {
        html: '<div>Improved</div>',
        css: '/** improved */',
        js: '// improved',
        explanation: 'I improved the div.',
      };
      const mockResponseString = JSON.stringify(mockResponse);
      
      mockAiInstance.models.generateContentStream.mockResolvedValue(
        createMockStreamWithTextMethod(mockResponseString)
      );

      const onStream = jest.fn();
      const result = await improveSnippet(
        { html: '', css: '', js: '' },
        'base64image',
        [],
        onStream
      );
      
      expect(result.newCode).toEqual({
        html: '<div>Improved</div>',
        css: '/** improved */',
        js: '// improved',
      });
      expect(result.explanation).toBe('I improved the div.');
      
      const streamedExplanation = onStream.mock.calls.map(call => call[0]).join('');
      expect(streamedExplanation).toBe('I improved the div.');

      expect(mockAiInstance.models.generateContentStream).toHaveBeenCalledTimes(1);
      const calledWith = mockAiInstance.models.generateContentStream.mock.calls[0][0];
      // Check that the multimodal prompt was constructed correctly
      expect(calledWith.contents.parts).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ text: expect.stringContaining("Current Code:") }),
            expect.objectContaining({ text: expect.stringContaining("History of previous improvements:") }),
            expect.objectContaining({ inlineData: { mimeType: 'image/jpeg', data: 'base64image' } }),
        ])
      );
    });
  });
});
