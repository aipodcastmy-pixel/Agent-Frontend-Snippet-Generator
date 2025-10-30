
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface CodeDisplayProps {
  language: string;
  code: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative h-full bg-[#0d1117]">
      <div className="absolute top-2 right-2 z-10">
        <span className="sr-only" aria-live="polite">
          {copied ? 'Code copied to clipboard!' : ''}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center px-3 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded-md hover:bg-gray-600 transition-colors"
          aria-label={`Copy ${language} code`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 mr-1 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4 mr-1" />
              Copy {language}
            </>
          )}
        </button>
      </div>
      <pre className="p-4 h-full overflow-auto">
        <code className={`language-${language.toLowerCase()} text-sm whitespace-pre-wrap`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeDisplay;
