import { cn } from '../../lib/utils';

const BARS = [
  { key: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
  { key: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' },
];

export function PlatformChart({ byPlatform }) {
  const instagram = byPlatform?.instagram ?? 0;
  const linkedin = byPlatform?.linkedin ?? 0;
  const total = instagram + linkedin;

  if (total === 0) {
    return <p className="text-sm text-gray-400 italic">Nenhum dado disponível.</p>;
  }

  const values = { instagram, linkedin };
  const pcts = {
    instagram: Math.round((instagram / total) * 100),
    linkedin: Math.round((linkedin / total) * 100),
  };

  return (
    <div
      className="space-y-3"
      role="img"
      aria-label={`Distribuição por plataforma: Instagram ${instagram} leads (${pcts.instagram}%), LinkedIn ${linkedin} leads (${pcts.linkedin}%)`}
    >
      {BARS.map((bar) => (
        <div key={bar.key} className="flex items-center gap-3">
          <span className="w-20 text-sm text-gray-600 shrink-0">{bar.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={cn('h-3 rounded-full transition-all duration-500', bar.color)}
              style={{ width: `${pcts[bar.key]}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 shrink-0 w-28 text-right">
            {values[bar.key].toLocaleString('pt-BR')} ({pcts[bar.key]}%)
          </span>
        </div>
      ))}
    </div>
  );
}
