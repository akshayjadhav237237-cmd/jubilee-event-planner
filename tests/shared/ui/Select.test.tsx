import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { Select, type SelectOption } from '../../../src/shared/ui/Select';

const categoryOptions: readonly SelectOption[] = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'photography', label: 'Photography', disabled: true },
];

describe('Select component', () => {
  it('renders select dropdown with all options', () => {
    render(
      <div>
        <label htmlFor="service-type">Service Type</label>
        <Select id="service-type" value="catering" options={categoryOptions} onChange={() => {}} />
      </div>,
    );

    const select = screen.getByLabelText('Service Type');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('catering');
    expect(screen.getByRole('option', { name: 'Photography' })).toBeDisabled();
  });

  it('calls onChange when user selects an option', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <div>
        <label htmlFor="service-select">Select Service</label>
        <Select
          id="service-select"
          value="venue"
          options={categoryOptions}
          onChange={handleChange}
        />
      </div>,
    );

    await user.selectOptions(screen.getByLabelText('Select Service'), 'catering');
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styles and sets aria-invalid', () => {
    render(
      <div>
        <label htmlFor="err-select">Error Select</label>
        <Select id="err-select" value="venue" options={categoryOptions} error onChange={() => {}} />
      </div>,
    );

    const select = screen.getByLabelText('Error Select');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveClass('border-rose-500');
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="a11y-select">Event Category</label>
        <Select id="a11y-select" value="venue" options={categoryOptions} onChange={() => {}} />
      </div>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
