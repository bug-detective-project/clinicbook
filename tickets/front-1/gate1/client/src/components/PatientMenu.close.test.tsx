import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';

async function openMenu(name: string): Promise<HTMLElement> {
  const toggle = await screen.findByRole('button', { name: `Actions for ${name}` });
  await userEvent.click(toggle);
  expect(screen.getByRole('menu', { name: `Actions for ${name}` })).toBeInTheDocument();
  return toggle;
}

describe('closing the menu of a patient', () => {
  it('closes when the user clicks somewhere else on the page', async () => {
    mockApi();
    await renderApp('/patients');
    const toggle = await openMenu('Bruno Carvalho');

    await userEvent.click(screen.getByRole('heading', { level: 2, name: 'Patients' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes with Escape and gives the focus back to its button', async () => {
    mockApi();
    await renderApp('/patients');
    const toggle = await openMenu('Bruno Carvalho');
    await userEvent.tab();
    expect(screen.getByRole('menuitem', { name: 'Open record' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('closes when the menu of another patient is opened', async () => {
    mockApi();
    await renderApp('/patients');
    await openMenu('Bruno Carvalho');

    await openMenu('Camila Duarte');

    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(screen.queryByRole('menu', { name: 'Actions for Bruno Carvalho' })).not.toBeInTheDocument();
  });

  it('stays open while the user clicks inside it, and its items still work', async () => {
    mockApi();
    await renderApp('/patients');
    await openMenu('Davi Fernandes');

    await userEvent.click(screen.getByRole('menu', { name: 'Actions for Davi Fernandes' }));
    expect(screen.getByRole('menu', { name: 'Actions for Davi Fernandes' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Book appointment' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Book appointment' })).toBeInTheDocument();
  });

  it('does nothing on Escape while every menu is closed', async () => {
    mockApi();
    await renderApp('/patients');
    const toggle = await screen.findByRole('button', { name: 'Actions for Bruno Carvalho' });
    toggle.focus();

    await userEvent.keyboard('{Escape}');

    expect(toggle).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
