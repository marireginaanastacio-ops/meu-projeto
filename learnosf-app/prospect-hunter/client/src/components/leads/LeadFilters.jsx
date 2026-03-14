import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

const PLATFORMS = [
  { value: '', label: 'Todos' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
];

const STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'Novo', label: 'Novo' },
  { value: 'Contatado', label: 'Contatado' },
  { value: 'Respondeu', label: 'Respondeu' },
  { value: 'Convertido', label: 'Convertido' },
  { value: 'Descartado', label: 'Descartado' },
];

function ChipGroup({ label, options, selected, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
              isSelected
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function LeadFilters({ filters, onFilterChange, onClearFilters, hasActiveFilters }) {
  return (
    <div className="space-y-3 mb-5">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Buscar por nome ou bio..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-8"
          aria-label="Buscar leads por nome ou bio"
        />
      </div>

      {/* Chips de plataforma */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-gray-500 shrink-0">Plataforma:</span>
        <ChipGroup
          label="Filtrar por plataforma"
          options={PLATFORMS}
          selected={filters.platform}
          onChange={(v) => onFilterChange('platform', v)}
        />
      </div>

      {/* Chips de status */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-gray-500 shrink-0">Status:</span>
        <ChipGroup
          label="Filtrar por status"
          options={STATUSES}
          selected={filters.status}
          onChange={(v) => onFilterChange('status', v)}
        />
      </div>

      {/* Botão limpar filtros */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={cn(
            'inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded'
          )}
          aria-label="Limpar todos os filtros"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Limpar filtros
        </button>
      )}
    </div>
  );
}
