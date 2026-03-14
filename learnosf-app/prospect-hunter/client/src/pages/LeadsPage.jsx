import { useLeads } from '../hooks/useLeads';
import { LeadList } from '../components/leads/LeadList';

export function LeadsPage() {
  const { leads, loading, error, total } = useLeads();

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {total} {total === 1 ? 'lead encontrado' : 'leads encontrados'}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Erro ao carregar leads: {error}
        </div>
      )}

      <LeadList leads={leads} loading={loading} />
    </main>
  );
}
