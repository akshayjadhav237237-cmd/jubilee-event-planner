import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../../../src/shared/ui/Dialog';

describe('Dialog component', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
  });

  it('renders modal dialog with accessible title and content when open', () => {
    render(
      <Dialog open={true} onClose={() => {}} title="Event Confirmation">
        <p>Booking details saved successfully.</p>
      </Dialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Event Confirmation' })).toBeInTheDocument();
    expect(screen.getByText('Booking details saved successfully.')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Dialog open={true} onClose={handleClose} title="Cancel Reservation">
        <p>Are you sure you want to cancel?</p>
      </Dialog>,
    );

    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('restores focus to previously active element on close', async () => {
    const handleClose = vi.fn();
    const trigger = document.createElement('button');
    trigger.textContent = 'Open modal';
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <Dialog open={true} onClose={handleClose} title="Focus Restore Test">
        <p>Modal body</p>
      </Dialog>,
    );

    rerender(
      <Dialog open={false} onClose={handleClose} title="Focus Restore Test">
        <p>Modal body</p>
      </Dialog>,
    );

    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <Dialog open={true} onClose={() => {}} title="Accessible Dialog">
        <p>Accessible modal content description.</p>
      </Dialog>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
