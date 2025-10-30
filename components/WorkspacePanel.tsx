
import React, { useState } from 'react';
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'preview', label: 'Preview', icon: <EyeIcon className="w-4 h-4 mr-2" /> },
    { id: 'html', label: 'HTML', icon: <CodeIcon className="w-4 h-4 mr-2" /> },
    { id: 'css', label: 'CSS', icon: <CodeIcon className="w-4 h-4 mr-2" /> },
    { id: 'js', label: 'JS', icon: <CodeIcon className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="w-full flex flex-col h-full bg-gray-900">
      <div className="flex-shrink-0 border-b border-gray-700">
        <nav className="flex space-x-2 p-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } px-3 py-2 font-medium text-sm rounded-md flex items-center transition-colors`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-auto bg-gray-900">
        {activeTab === 'preview' && <Preview code={code} iframeRef={iframeRef} />}
        {activeTab === 'html' && <CodeDisplay language="HTML" code={code.html} />}
        {activeTab === 'css' && <CodeDisplay language="CSS" code={code.css} />}
        {activeTab === 'js' && <CodeDisplay language="JavaScript" code={code.js} />}
      </div>
    </div>
  );
};

export default WorkspacePanel;
