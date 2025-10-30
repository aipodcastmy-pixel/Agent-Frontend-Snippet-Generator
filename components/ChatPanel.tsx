
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { BotIcon, UserIcon, SendIcon, MagicIcon } from './Icons';

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  isImproving: boolean;
  autoImproveEnabled: boolean;
  onToggleAutoImprove: () => void;
  onSendMessage: (message: string) => void;
  autoImproveSteps: number;
  onSetAutoImproveSteps: (steps: number) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  chatHistory,
  isLoading,
  isImproving,
  autoImproveEnabled,
  onToggleAutoImprove,
  onSendMessage,
  autoImproveSteps,
  onSetAutoImproveSteps
}) => {
  const [prompt, setPrompt] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = () => {
    if (prompt.trim()) {
      onSendMessage(prompt.trim());
      setPrompt('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-gray-800 border-l border-gray-700">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.author === MessageAuthor.USER ? 'justify-end' : ''}`}>
              {msg.author === MessageAuthor.AI && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                  <BotIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`p-3 rounded-lg max-w-sm md:max-w-md lg:max-w-lg ${msg.author === MessageAuthor.AI ? 'bg-gray-700 text-gray-200' : 'bg-blue-600 text-white'}`}>
                <div className="prose prose-invert prose-sm max-w-none break-words">
                  {msg.content}
                </div>
              </div>
              {msg.author === MessageAuthor.USER && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
           {(isLoading && !isImproving) && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                <BotIcon className="w-5 h-5 text-white" />
              </div>
              <div className="p-3 rounded-lg bg-gray-700 text-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <label htmlFor="auto-improve" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input id="auto-improve" type="checkbox" className="sr-only" checked={autoImproveEnabled} onChange={onToggleAutoImprove} />
                        <div className={`block w-10 h-6 rounded-full ${autoImproveEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoImproveEnabled ? 'transform translate-x-full' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-medium text-gray-300 flex items-center gap-1.5"><MagicIcon className="w-4 h-4 text-yellow-400"/> Auto-Improve</div>
                </label>
            </div>
            {autoImproveEnabled && (
                <div className="flex items-center gap-2">
                    <label htmlFor="steps" className="text-sm font-medium text-gray-400">Steps:</label>
                    <select id="steps" value={autoImproveSteps} onChange={(e) => onSetAutoImproveSteps(Number(e.target.value))} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-16 p-1">
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            )}
        </div>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., a responsive login form with a show/hide password toggle"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pr-12 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            rows={2}
            disabled={isLoading || isImproving}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isImproving || !prompt.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
