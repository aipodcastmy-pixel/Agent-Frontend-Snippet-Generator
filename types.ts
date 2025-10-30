
import React from 'react';

export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  author: MessageAuthor;
  content: string | React.ReactNode;
}

export interface CodeSnippet {
  html: string;
  css: string;
  js: string;
}

export interface ImprovementStep {
  explanation: string;
  screenshot: string; // base64 encoded
}
