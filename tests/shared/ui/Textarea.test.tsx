import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '../../../src/shared/ui/Textarea';

describe('Textarea component', () => {
  it('renders textarea with given rows and placeholder', () => {
    render(
      <div>
        <label htmlFor="notes-area">Notes</label>
        <Textarea
          id="notes-area"
          value="Initial note"
          rows={5}
          placeholder="Add details"
          onChange={() => {}}
        />
      </div>,
    );

    const textarea = screen.getByLabelText('Notes');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Initial note');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('placeholder', 'Add details');
  });

  it('triggers onChange when typed into', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <div>
        <label htmlFor="diet-area">Dietary Restrictions</label>
        <Textarea id="diet-area" value="" onChange={handleChange} />
      </div>,
    );

    await user.type(screen.getByLabelText('Dietary Restrictions'), 'Vegan only');
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styling when error is true', () => {
    render(
      <div>
        <label htmlFor="err-area">Feedback</label>
        <Textarea id="err-area" value="" error onChange={() => {}} />
      </div>,
    );

    const textarea = screen.getByLabelText('Feedback');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveClass('border-rose-500');
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="a11y-textarea">Brief Description</label>
        <Textarea id="a11y-textarea" value="Sample description text" onChange={() => {}} />
      </div>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
