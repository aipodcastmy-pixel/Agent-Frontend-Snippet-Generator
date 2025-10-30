
import React, { useMemo } from 'react';
import { CodeSnippet } from '../types';

interface PreviewProps {
  code: CodeSnippet;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const Preview: React.FC<PreviewProps> = ({ code, iframeRef }) => {
  const srcDoc = useMemo(() => {
    return `
      <html>
        <head>
          <style>
            /* Basic styles for dark mode preview */
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                background-color: #111827; /* bg-gray-900 */
                color: #d1d5db; /* text-gray-300 */
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                padding: 1rem;
                box-sizing: border-box;
             }
            ${code.css}
          </style>
        </head>
        <body>
          ${code.html}
          <script>${code.js}</script>
        </body>
      </html>
    `;
  }, [code]);

  return (
    <div className="h-full w-full bg-gray-900 flex items-center justify-center p-4">
        <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Preview"
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="w-full h-full border-2 border-gray-700 rounded-lg bg-white"
        />
    </div>
  );
};

export default Preview;