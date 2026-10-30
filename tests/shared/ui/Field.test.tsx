import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { Field } from '../../../src/shared/ui/Field';

describe('Field component', () => {
  it('renders label linked to input and displays helper text', () => {
    render(
      <Field id="event-title" label="Event Title" helperText="Max 60 characters">
        {(props) => <input {...props} type="text" />}
      </Field>,
    );

    const input = screen.getByLabelText('Event Title');
    expect(input).toBeInTheDocument();
    expect(screen.getByText('Max 60 characters')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', 'event-title-helper');
  });

  it('renders error message with role alert and sets aria-invalid', () => {
    render(
      <Field
        id="budget-input"
        label="Target Budget"
        error="Budget must be greater than zero"
        required
      >
        {(props) => <input {...props} type="number" />}
      </Field>,
    );

    const alertMessage = screen.getByRole('alert');
    expect(alertMessage).toHaveTextContent('Budget must be greater than zero');
    const input = screen.getByLabelText(/Target Budget/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'budget-input-error');
  });

  it('supports direct child element without render function', () => {
    render(
      <Field id="static-input" label="Static Field">
        <input id="static-input" type="text" />
      </Field>,
    );

    expect(screen.getByLabelText('Static Field')).toBeInTheDocument();
  });

  it('has zero axe-core accessibility violations', async () => {
    const { container } = render(
      <Field id="accessible-field" label="Event Location" helperText="City or venue name">
        {(props) => <input {...props} type="text" />}
      </Field>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
