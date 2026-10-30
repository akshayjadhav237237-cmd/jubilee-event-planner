import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { ChipCheckbox } from '../../../src/shared/ui/ChipCheckbox';

describe('ChipCheckbox component', () => {
  it('renders label, badge, and reflects checked status', () => {
    render(
      <ChipCheckbox
        id="catering-filter"
        label="Catering"
        badge={5}
        checked={true}
        onChange={() => {}}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /catering/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('triggers onChange when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ChipCheckbox id="dj-filter" label="DJ & Music" checked={false} onChange={handleChange} />,
    );

    await user.click(screen.getByRole('checkbox', { name: /dj & music/i }));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('supports keyboard space key toggle', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ChipCheckbox id="lights-filter" label="Lighting" checked={false} onChange={handleChange} />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /lighting/i });
    checkbox.focus();
    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('prevents interaction when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ChipCheckbox
        id="disabled-filter"
        label="Unavailable"
        checked={false}
        disabled
        onChange={handleChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /unavailable/i });
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <ChipCheckbox
        id="a11y-chip"
        label="Outdoor Seating"
        checked={true}
        badge="Hot"
        onChange={() => {}}
      />,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
