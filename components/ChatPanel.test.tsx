import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPanel from './ChatPanel';
import { MessageAuthor } from '../types';
// FIX: Import jest globals to fix test runner related errors.
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockProps = {
  chatHistory: [
    { author: MessageAuthor.AI, content: 'Hello!' },
    { author: MessageAuthor.USER, content: 'Hi there.' },
  ],
  isLoading: false,
  isImproving: false,
  autoImproveEnabled: false,
  onToggleAutoImprove: jest.fn(),
  onSendMessage: jest.fn(),
  autoImproveSteps: 3,
  onSetAutoImproveSteps: jest.fn(),
};

describe('ChatPanel', () => {
    beforeEach(() => {
        // Clear mock function calls before each test
        jest.clearAllMocks();
    });

  it('renders chat history correctly', () => {
    render(<ChatPanel {...mockProps} />);
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there.')).toBeInTheDocument();
  });

  it('calls onSendMessage when the send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatPanel {...mockProps} />);
    
    const textbox = screen.getByPlaceholderText(/a responsive login form/i);
    await user.type(textbox, 'Create a button');
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    expect(mockProps.onSendMessage).toHaveBeenCalledWith('Create a button');
  });

  it('calls onSendMessage when Enter is pressed without Shift', async () => {
    const user = userEvent.setup();
    render(<ChatPanel {...mockProps} />);
    
    const textbox = screen.getByPlaceholderText(/a responsive login form/i);
    await user.type(textbox, 'Create a card{enter}');
    
    expect(mockProps.onSendMessage).toHaveBeenCalledWith('Create a card');
    expect(textbox).toHaveValue(''); // Textbox should clear after sending
  });

  it('does not send message with Shift+Enter', async () => {
    const user = userEvent.setup();
    render(<ChatPanel {...mockProps} />);
    
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'Create a card with a new line{shift>}{enter}{/shift}');

    expect(mockProps.onSendMessage).not.toHaveBeenCalled();
    expect(textbox).toHaveValue('Create a card with a new line\n');
  });


  it('disables input and button when loading', () => {
    render(<ChatPanel {...mockProps} isLoading={true} />);
    
    const textbox = screen.getByPlaceholderText(/a responsive login form/i);
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    expect(textbox).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('disables send button when prompt is empty', () => {
    render(<ChatPanel {...mockProps} />);
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });

  it('toggles auto-improve checkbox', async () => {
    const user = userEvent.setup();
    render(<ChatPanel {...mockProps} />);
    
    // The input itself is visually hidden, so we get it by its role or label
    const checkbox = screen.getByRole('checkbox', { name: /auto-improve/i });
    await user.click(checkbox);
    
    expect(mockProps.onToggleAutoImprove).toHaveBeenCalledTimes(1);
  });

  it('shows and updates auto-improve steps when enabled', async () => {
    const user = userEvent.setup();
    render(<ChatPanel {...mockProps} autoImproveEnabled={true} />);
    
    const stepsSelect = screen.getByLabelText(/steps/i);
    expect(stepsSelect).toBeInTheDocument();
    
    await user.selectOptions(stepsSelect, '5');
    expect(mockProps.onSetAutoImproveSteps).toHaveBeenCalledWith(5);
  });
});
