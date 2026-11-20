import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { DatePicker } from './DatePicker.tsx';

const TODAY = '2026-03-18';

function Holder({ start = '2026-03-10', min, max = TODAY, optional }: { start?: string; min?: string; max?: string; optional?: boolean }) {
  const [value, setValue] = useState(start);
  return (
    <>
      <DatePicker label="Day" value={value} onChange={setValue} today={TODAY} min={min} max={max} optional={optional} />
      <output data-testid="held">{value}</output>
    </>
  );
}

const trigger = () => screen.getByRole('button', { name: /^Day, / });
const day = (name: string) => screen.getByRole('button', { name });

describe('the date picker', () => {
  it('shows the date, and opens a calendar of its month on the chosen day, with today marked', async () => {
    render(<Holder />);
    expect(trigger()).toHaveAccessibleName('Day, March 10, 2026');
    expect(trigger()).toHaveTextContent('Mar 10, 2026');

    await userEvent.click(trigger());

    expect(screen.getByRole('dialog', { name: 'Choose the date for Day' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Month' })).toHaveDisplayValue('March');
    expect(screen.getByRole('combobox', { name: 'Year' })).toHaveDisplayValue('2026');
    expect(day('Tuesday, March 10, 2026')).toHaveFocus();
    expect(day('Tuesday, March 10, 2026')).toHaveAttribute('aria-pressed', 'true');
    expect(day('Wednesday, March 18, 2026')).toHaveAttribute('aria-current', 'date');
  });

  it('picks a day, closes, and gives the focus back to its button', async () => {
    render(<Holder />);
    await userEvent.click(trigger());

    await userEvent.click(day('Monday, March 2, 2026'));

    expect(screen.getByTestId('held')).toHaveTextContent('2026-03-02');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('cannot pick a day outside its limits', async () => {
    render(<Holder min="2026-03-05" />);
    await userEvent.click(trigger());

    expect(day('Thursday, March 19, 2026')).toBeDisabled();
    expect(day('Wednesday, March 4, 2026')).toBeDisabled();
    expect(day('Wednesday, March 18, 2026')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });

  it('moves with the keyboard: arrows by day and week, PageUp by month, Enter picks', async () => {
    render(<Holder max="2026-12-31" />);
    await userEvent.click(trigger());

    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    expect(day('Wednesday, March 18, 2026')).toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    expect(screen.getByRole('combobox', { name: 'Month' })).toHaveDisplayValue('February');
    expect(day('Wednesday, February 18, 2026')).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByTestId('held')).toHaveTextContent('2026-02-18');
  });

  it('jumps to any month and year with the lists, as for a birth date', async () => {
    render(<Holder start="" optional />);
    await userEvent.click(trigger());

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Year' }), '1985');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Month' }), 'July');
    await userEvent.click(day('Tuesday, July 9, 1985'));

    expect(screen.getByTestId('held')).toHaveTextContent('1985-07-09');
  });

  it('starts empty when nothing is chosen, and clears an optional date', async () => {
    render(<Holder start="" optional />);
    expect(trigger()).toHaveAccessibleName('Day, not chosen');
    expect(trigger()).toHaveTextContent('Choose a date');

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByTestId('held')).toHaveTextContent(TODAY);

    await userEvent.click(screen.getByRole('button', { name: 'Clear Day' }));
    expect(screen.getByTestId('held')).toBeEmptyDOMElement();
  });

  it('closes with Escape or a click outside, keeping the date', async () => {
    render(<Holder />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{ArrowRight}{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(screen.getByTestId('held')).toHaveTextContent('2026-03-10');

    await userEvent.click(trigger());
    await userEvent.click(screen.getByTestId('held'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
