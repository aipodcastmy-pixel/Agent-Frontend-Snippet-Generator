/**
 * Custom error class for failures related to the Gemini API.
 */
export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Custom error class for failures in parsing the JSON response from the model.
 */
export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingError';
  }
}
