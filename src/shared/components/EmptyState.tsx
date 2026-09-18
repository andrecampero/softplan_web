import type { ReactNode } from 'react';

export function EmptyState({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="estado estado--vazio" role="status">
      <p className="estado__titulo">{titulo}</p>
      {children && <p>{children}</p>}
    </div>
  );
}
