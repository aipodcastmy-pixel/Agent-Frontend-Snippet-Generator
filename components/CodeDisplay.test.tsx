import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeDisplay from './CodeDisplay';
// FIX: Import jest globals to fix test runner related errors.
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('CodeDisplay', () => {
  beforeEach(() => {
    // Clear mock history and reset timers before each test
    (navigator.clipboard.writeText as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockProps = {
    language: 'HTML',
    code: '<h1>Test Code</h1>',
  };

  it('renders the code and copy button', () => {
    render(<CodeDisplay {...mockProps} />);
    expect(screen.getByText('<h1>Test Code</h1>')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy HTML' })).toBeInTheDocument();
  });

  it('copies code to clipboard and shows "Copied!" message', async () => {
    const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime
    });
    render(<CodeDisplay {...mockProps} />);
    
    const copyButton = screen.getByRole('button', { name: 'Copy HTML' });
    await user.click(copyButton);

    // Check if clipboard API was called with the correct code
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<h1>Test Code</h1>');

    // Check for visual feedback
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    expect(screen.queryByText('Copy HTML')).not.toBeInTheDocument();
    
    // Check screen reader announcement region
    expect(screen.getByText('Code copied to clipboard!')).toBeInTheDocument();

    // Fast-forward time to check if it reverts
    jest.advanceTimersByTime(2000);
    
    // The button text should revert back
    expect(await screen.findByText('Copy HTML')).toBeInTheDocument();
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });
});
