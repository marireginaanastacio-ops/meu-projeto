import { Users, Star, MessageSquare, TrendingUp, BarChart2 } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { StatCard } from '../components/dashboard/StatCard';
import { PlatformChart } from '../components/dashboard/PlatformChart';
import { SearchForm } from '../components/search/SearchForm';

function buildStatCards(stats) {
  const converted = stats?.byStatus?.Convertido ?? 0;
  const total = stats?.total ?? 0;
  const conversionRate = total > 0 ? `${((converted / total) * 100).toFixed(1)}%` : '—';

  return [
    {
      title: 'Total de Leads',
      value: total || '—',
      icon: Users,
      colorClass: 'bg-gray-100 text-gray-600',
    },
    {
      title: 'Novos',
      value: stats?.byStatus?.Novo ?? '—',
      icon: Star,
      colorClass: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Contatados',
      value: stats?.byStatus?.Contatado ?? '—',
      icon: MessageSquare,
      colorClass: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Convertidos',
      value: converted || '—',
      icon: TrendingUp,
      colorClass: 'bg-green-50 text-green-600',
    },
    {
      title: 'Taxa de Conversão',
      value: conversionRate,
      icon: BarChart2,
      colorClass: 'bg-purple-50 text-purple-600',
    },
  ];
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" aria-busy="true" aria-label="Carregando métricas">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-pulse">
          <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-7 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { stats, loading, error, refetch } = useStats();

  return (
    <main className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Visão geral do seu pipeline de prospecção
        </p>
      </div>

      {/* Métricas */}
      <section aria-labelledby="metrics-heading">
        <h3 id="metrics-heading" className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Métricas
        </h3>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700"
          >
            Erro ao carregar métricas: {error}
          </div>
        )}
        {loading ? (
          <MetricsSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {buildStatCards(stats).map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        )}
      </section>

      {/* Gráfico de plataforma */}
      {!loading && stats && (
        <section aria-labelledby="platform-heading">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h3
              id="platform-heading"
              className="text-sm font-medium text-gray-700 mb-4"
            >
              Distribuição por Plataforma
            </h3>
            <PlatformChart byPlatform={stats.byPlatform} />
          </div>
        </section>
      )}

      {/* Nova Busca */}
      <section aria-labelledby="search-heading">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h3
            id="search-heading"
            className="text-base font-semibold text-gray-900 mb-4"
          >
            Nova Busca de Prospects
          </h3>
          <SearchForm onSearchComplete={refetch} />
        </div>
      </section>
    </main>
  );
}
