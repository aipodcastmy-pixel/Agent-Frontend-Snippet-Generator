import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspacePanel from './WorkspacePanel';
// FIX: Import jest globals to fix test runner related errors.
import { describe, it, expect } from '@jest/globals';

const mockCode = {
  html: '<div>Hello</div>',
  css: 'div { color: red; }',
  js: 'console.log("hello")',
};

describe('WorkspacePanel', () => {
  const iframeRef = React.createRef<HTMLIFrameElement>();

  it('renders tabs and shows Preview tab by default', () => {
    render(<WorkspacePanel code={mockCode} iframeRef={iframeRef} />);
    
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    const previewPanel = screen.getByRole('tabpanel', { name: /preview/i });

    expect(previewTab).toHaveAttribute('aria-selected', 'true');
    expect(previewPanel).toBeVisible();
    expect(screen.getByRole('tabpanel', { name: /html/i, hidden: true })).not.toBeVisible();
  });

  it('switches to HTML tab on click', async () => {
    const user = userEvent.setup();
    render(<WorkspacePanel code={mockCode} iframeRef={iframeRef} />);
    
    const htmlTab = screen.getByRole('tab', { name: /html/i });
    await user.click(htmlTab);

    expect(htmlTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: /html/i })).toBeVisible();
    expect(screen.getByText('<div>Hello</div>')).toBeInTheDocument();
  });

  it('switches tabs with keyboard navigation (ArrowRight and ArrowLeft)', () => {
    render(<WorkspacePanel code={mockCode} iframeRef={iframeRef} />);
    
    const [previewTab, htmlTab, cssTab] = screen.getAllByRole('tab');
    previewTab.focus();
    expect(previewTab).toHaveFocus();

    // Navigate right
    fireEvent.keyDown(previewTab, { key: 'ArrowRight' });
    expect(htmlTab).toHaveFocus();

    // Navigate right again
    fireEvent.keyDown(htmlTab, { key: 'ArrowRight' });
    expect(cssTab).toHaveFocus();

    // Navigate left
    fireEvent.keyDown(cssTab, { key: 'ArrowLeft' });
    expect(htmlTab).toHaveFocus();
  });

  it('wraps keyboard navigation from last to first tab', () => {
    render(<WorkspacePanel code={mockCode} iframeRef={iframeRef} />);
    
    const tabs = screen.getAllByRole('tab');
    const lastTab = tabs[tabs.length - 1];
    lastTab.focus();

    fireEvent.keyDown(lastTab, { key: 'ArrowRight' });
    expect(tabs[0]).toHaveFocus();
  });

  it('wraps keyboard navigation from first to last tab', () => {
    render(<WorkspacePanel code={mockCode} iframeRef={iframeRef} />);
    
    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0];
    const lastTab = tabs[tabs.length - 1];
    firstTab.focus();

    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });
    expect(lastTab).toHaveFocus();
  });
});
