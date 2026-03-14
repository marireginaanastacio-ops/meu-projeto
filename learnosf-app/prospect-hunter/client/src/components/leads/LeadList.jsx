import { LeadCard } from './LeadCard';
import { Skeleton } from '../ui/skeleton';
import { Users } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function LeadList({ leads, loading, onLeadClick }) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando leads">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum lead encontrado</h3>
        <p className="text-sm text-gray-500">
          Acesse o Dashboard para realizar sua primeira busca de prospects.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
      ))}
    </div>
  );
}
