import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const PLATFORM_STYLES = {
  instagram: { label: 'Instagram', className: 'bg-pink-500 text-white' },
  linkedin: { label: 'LinkedIn', className: 'bg-blue-700 text-white' },
};

const STATUS_STYLES = {
  Novo: 'bg-gray-100 text-gray-700',
  Contatado: 'bg-yellow-100 text-yellow-700',
  Respondeu: 'bg-blue-100 text-blue-700',
  Convertido: 'bg-green-100 text-green-700',
  Descartado: 'bg-red-100 text-red-700',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  } catch {
    return '—';
  }
}

export function LeadCard({ lead, onClick }) {
  const platform = PLATFORM_STYLES[lead.plataforma] ?? { label: lead.plataforma, className: 'bg-gray-100 text-gray-700' };
  const statusClass = STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-700';
  const bio = lead.bio ? (lead.bio.length > 100 ? lead.bio.slice(0, 97) + '...' : lead.bio) : null;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(lead)}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${lead.nome}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(lead)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{lead.nome}</h3>
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0', platform.className)}>
            {platform.label}
          </span>
        </div>

        {bio && (
          <p className="text-sm text-gray-500 mb-3 leading-snug">{bio}</p>
        )}

        <div className="flex items-center justify-between">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', statusClass)}>
            {lead.status}
          </span>
          <span className="text-xs text-gray-400">{formatDate(lead.data_captura)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
