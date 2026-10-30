import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../../../src/shared/ui/Input';

describe('Input component', () => {
  it('renders input with value and placeholder', () => {
    render(
      <div>
        <label htmlFor="party-name">Party Name</label>
        <Input
          id="party-name"
          value="Birthday Bash"
          placeholder="Enter party name"
          onChange={() => {}}
        />
      </div>,
    );

    const input = screen.getByLabelText('Party Name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Birthday Bash');
    expect(input).toHaveAttribute('placeholder', 'Enter party name');
  });

  it('triggers onChange when typed into', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <div>
        <label htmlFor="guest-count">Guest Count</label>
        <Input id="guest-count" value="" onChange={handleChange} />
      </div>,
    );

    await user.type(screen.getByLabelText('Guest Count'), '50');
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styling and aria-invalid when error is true', () => {
    render(
      <div>
        <label htmlFor="email-input">Email Address</label>
        <Input id="email-input" value="invalid" error={true} onChange={() => {}} />
      </div>,
    );

    const input = screen.getByLabelText('Email Address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-rose-500');
  });

  it('respects disabled attribute', () => {
    render(
      <div>
        <label htmlFor="locked-input">Locked Input</label>
        <Input id="locked-input" value="Fixed" disabled onChange={() => {}} />
      </div>,
    );

    const input = screen.getByLabelText('Locked Input');
    expect(input).toBeDisabled();
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="a11y-input">Full Name</label>
        <Input id="a11y-input" value="Ada Lovelace" onChange={() => {}} />
      </div>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
