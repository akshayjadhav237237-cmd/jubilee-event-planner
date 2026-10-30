import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetConfirmDialog } from '../../../src/features/reset/ResetConfirmDialog';

describe('ResetConfirmDialog component', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
  });

  it('renders confirmation dialog title, warning body, and action buttons when open', () => {
    render(<ResetConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Reset Celebration Plan' })).toBeInTheDocument();
    expect(
      screen.getByText(/All unsaved changes and progress will be cleared/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Plan' })).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(<ResetConfirmDialog isOpen={true} onClose={handleClose} onConfirm={handleConfirm} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Reset Plan button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(<ResetConfirmDialog isOpen={true} onClose={handleClose} onConfirm={handleConfirm} />);

    const resetButton = screen.getByRole('button', { name: 'Reset Plan' });
    await user.click(resetButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('passes axe accessibility checks without violations', async () => {
    const { container } = render(
      <ResetConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
