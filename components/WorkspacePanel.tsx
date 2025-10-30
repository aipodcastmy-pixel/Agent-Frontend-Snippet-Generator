
import React, { useState, useRef } from 'react';
import { CodeSnippet } from '../types';
import CodeDisplay from './CodeDisplay';
import Preview from './Preview';
import { EyeIcon, CodeIcon } from './Icons';

interface WorkspacePanelProps {
  code: CodeSnippet;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

type Tab = 'preview' | 'html' | 'css' | 'js';

const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ code, iframeRef }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'preview', label: 'Preview', icon: <EyeIcon className="w-4 h-4 mr-2" /> },
    { id: 'html', label: 'HTML', icon: <CodeIcon className="w-4 h-4 mr-2" /> },
    { id: 'css', label: 'CSS', icon: <CodeIcon className="w-4 h-4 mr-2" /> },
    { id: 'js', label: 'JS', icon: <CodeIcon className="w-4 h-4 mr-2" /> },
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex: number | undefined;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (newIndex !== undefined) {
      e.preventDefault();
      tabRefs.current[newIndex]?.focus();
    }
  };


  return (
    <div className="w-full flex flex-col h-full bg-gray-900">
      <div className="flex-shrink-0 border-b border-gray-700">
        <div role="tablist" className="flex space-x-2 p-2" aria-label="Code view tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              ref={(el) => (tabRefs.current[index] = el)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } px-3 py-2 font-medium text-sm rounded-md flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-900">
        <div id="tabpanel-preview" role="tabpanel" tabIndex={0} aria-labelledby="tab-preview" hidden={activeTab !== 'preview'} className="h-full">
           <Preview code={code} iframeRef={iframeRef} />
        </div>
        <div id="tabpanel-html" role="tabpanel" tabIndex={0} aria-labelledby="tab-html" hidden={activeTab !== 'html'} className="h-full">
            <CodeDisplay language="HTML" code={code.html} />
        </div>
        <div id="tabpanel-css" role="tabpanel" tabIndex={0} aria-labelledby="tab-css" hidden={activeTab !== 'css'} className="h-full">
            <CodeDisplay language="CSS" code={code.css} />
        </div>
        <div id="tabpanel-js" role="tabpanel" tabIndex={0} aria-labelledby="tab-js" hidden={activeTab !== 'js'} className="h-full">
            <CodeDisplay language="JavaScript" code={code.js} />
        </div>
      </div>
    </div>
  );
};

export default WorkspacePanel;
