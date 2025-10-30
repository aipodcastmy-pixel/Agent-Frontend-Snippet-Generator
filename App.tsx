
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatPanel from './components/ChatPanel';
import WorkspacePanel from './components/WorkspacePanel';
import { ChatMessage, CodeSnippet, MessageAuthor, ImprovementStep } from './types';
import { generateInitialSnippet, improveSnippet } from './services/geminiService';
import { BotIcon } from './components/Icons';

function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      author: MessageAuthor.AI,
      content: "Hello! I'm your AI frontend assistant. Describe a component you'd like me to build.",
    },
  ]);
  const [code, setCode] = useState<CodeSnippet>({
    html: '<!-- Your component will appear here -->',
    css: '/* ...along with its styles */',
    js: '// ...and any necessary JavaScript.',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [autoImproveEnabled, setAutoImproveEnabled] = useState(false);
  const [autoImproveSteps, setAutoImproveSteps] = useState(3);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // Initial width percentage for left panel

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    let newLeftWidth = (e.clientX / window.innerWidth) * 100;
    if (newLeftWidth < 25) newLeftWidth = 25; // Min width
    if (newLeftWidth > 75) newLeftWidth = 75; // Max width
    setLeftPanelWidth(newLeftWidth);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);


  const handleSendMessage = useCallback(async (prompt: string) => {
    if (isLoading || isImproving) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { author: MessageAuthor.USER, content: prompt };
    const aiMessage: ChatMessage = { author: MessageAuthor.AI, content: '' };
    setChatHistory(prev => [...prev, userMessage, aiMessage]);

    try {
      const newCode = await generateInitialSnippet(prompt, (chunk) => {
        setChatHistory(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.author === MessageAuthor.AI) {
            const updatedContent = (typeof lastMessage.content === 'string' ? lastMessage.content : '') + chunk;
            return [...prev.slice(0, -1), { ...lastMessage, content: updatedContent }];
          }
          return prev;
        });
      });
      setCode(newCode);

      if (autoImproveEnabled) {
        await runAutoImprovement(newCode);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setChatHistory(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.author === MessageAuthor.AI) {
          return [...prev.slice(0, -1), { ...lastMessage, content: errorMessage }];
        }
        return [...prev, { author: MessageAuthor.AI, content: errorMessage }];
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isImproving, autoImproveEnabled, autoImproveSteps]);

  const runAutoImprovement = async (initialCode: CodeSnippet) => {
    setIsImproving(true);
    let currentCode = initialCode;
    const improvementHistory: ImprovementStep[] = [];

    // Helper function to wait for iframe to load, with a timeout
    const waitForIframeLoad = (iframe: HTMLIFrameElement): Promise<void> => {
      return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
              iframe.removeEventListener('load', listener);
              reject(new Error("Iframe load timed out after 5 seconds."));
          }, 5000);

          const listener = () => {
              clearTimeout(timeoutId);
              iframe.removeEventListener('load', listener);
              // A short delay after load ensures styles are painted
              setTimeout(resolve, 200); 
          };
          
          iframe.addEventListener('load', listener);
      });
    };

    for (let i = 0; i < autoImproveSteps; i++) {
      try {
        setChatHistory(prev => [...prev, {
          author: MessageAuthor.AI,
          content: (
            <div className="flex items-center gap-2">
              <BotIcon className="w-5 h-5 animate-spin" />
              <span>Auto-improving... (Step {i + 1}/{autoImproveSteps})</span>
            </div>
          )
        }]);

        if (!iframeRef.current) {
          throw new Error('Iframe ref is not available for screenshot.');
        }
        
        // Wait for the iframe to fully load the new content
        await waitForIframeLoad(iframeRef.current);

        if (!iframeRef.current.contentWindow?.document.body) {
          throw new Error('Iframe content is not accessible.');
        }

        const canvas = await (window as any).html2canvas(iframeRef.current.contentWindow.document.body, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#111827' // Match dark bg
        });
        const screenshotBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
        
        // Show the agent's view in the chat
        setChatHistory(prev => {
            const historyWithoutSpinner = prev.slice(0, -1);
            return [...historyWithoutSpinner, {
                author: MessageAuthor.AI,
                content: (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm italic text-gray-400">Here's my current view (Step {i+1}/{autoImproveSteps}). Analyzing for improvements...</p>
                        <img 
                            src={`data:image/jpeg;base64,${screenshotBase64}`} 
                            alt={`Preview for improvement step ${i + 1}`}
                            className="rounded-lg border-2 border-gray-600 w-full max-w-xs"
                        />
                    </div>
                )
            }];
        });

        const aiExplanationMessage: ChatMessage = { author: MessageAuthor.AI, content: '' };
        setChatHistory(prev => [...prev, aiExplanationMessage]);
        
        const result = await improveSnippet(currentCode, screenshotBase64, improvementHistory, (chunk) => {
            setChatHistory(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.author === MessageAuthor.AI) {
                    const updatedContent = (typeof lastMessage.content === 'string' ? lastMessage.content : '') + chunk;
                    return [...prev.slice(0, -1), { ...lastMessage, content: updatedContent }];
                }
                return prev;
            });
        });

        currentCode = result.newCode;
        setCode(currentCode);
        improvementHistory.push({ explanation: result.explanation, screenshot: screenshotBase64 });
      
      } catch (error) {
        console.error(`Improvement step ${i+1} failed:`, error);
        setChatHistory(prev => [...prev.slice(0,-1), { // Remove spinner message
          author: MessageAuthor.AI,
          content: `Sorry, an error occurred during improvement step ${i + 1}: ${(error as Error).message}`,
        }]);
        break; // Exit loop on error
      }
    }
    setIsImproving(false);
    setChatHistory(prev => [...prev, {
        author: MessageAuthor.AI,
        content: `Auto-improvement complete! I made ${improvementHistory.length} of ${autoImproveSteps} planned enhancements.`,
    }]);
  };


  return (
    <div className="flex flex-row h-screen font-sans bg-gray-900 text-gray-200 overflow-hidden">
      <div 
        className="h-full"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <WorkspacePanel code={code} iframeRef={iframeRef} />
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-2 h-full cursor-col-resize bg-gray-700 hover:bg-indigo-500 transition-colors duration-200 flex-shrink-0"
        aria-label="Resize panels"
        role="separator"
      />
      <div className="h-full flex-1">
         <ChatPanel
          chatHistory={chatHistory}
          isLoading={isLoading}
          isImproving={isImproving}
          autoImproveEnabled={autoImproveEnabled}
          onToggleAutoImprove={() => setAutoImproveEnabled(prev => !prev)}
          onSendMessage={handleSendMessage}
          autoImproveSteps={autoImproveSteps}
          onSetAutoImproveSteps={setAutoImproveSteps}
        />
      </div>
    </div>
  );
}

export default App;
