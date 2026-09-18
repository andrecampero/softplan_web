import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar } from './FilterBar';
import { ProcessoCard } from './ProcessoCard';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['em_andamento', 'Em andamento'],
    ['concluido', 'Concluído'],
  ] as const)('mostra o rótulo em texto para %s (não depende só da cor)', (status, rotulo) => {
    render(<StatusBadge status={status} />);

    expect(screen.getByText(rotulo)).toBeInTheDocument();
  });
});

describe('ProcessoCard', () => {
  it('exibe título, status e data de criação em pt-BR', () => {
    render(
      <ProcessoCard
        processo={{ id: '1', numero: 'FLN-1', titulo: 'Solicitação de alvará', status: 'concluido', criadoEm: '2026-03-10T15:00:00.000Z' }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Solicitação de alvará' })).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('10/03/2026')).toHaveAttribute('datetime', '2026-03-10T15:00:00.000Z');
  });
});

describe('FilterBar', () => {
  it('marca o filtro ativo com aria-pressed', () => {
    render(<FilterBar valor="concluido" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Concluído' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('avisa a troca de filtro e ignora clique no filtro já ativo', async () => {
    const onChange = vi.fn();
    render(<FilterBar valor={undefined} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Todos' }));
    await userEvent.click(screen.getByRole('button', { name: 'Em andamento' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('em_andamento');
  });
});
