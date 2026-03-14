import { useState } from 'react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { searchProspects } from '../../services/api';

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
];

export function SearchForm({ onSearchComplete }) {
  const [platform, setPlatform] = useState('instagram');
  const [keywords, setKeywords] = useState('');
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keywords.trim()) {
      setError('Palavras-chave são obrigatórias.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await searchProspects({
        platform,
        keywords: keywords.trim(),
        limit: Math.min(200, Math.max(10, Number(limit))),
      });
      setResult(res.data);
      onSearchComplete?.();
    } catch (err) {
      setError(err.message ?? 'Erro ao realizar busca.');
    } finally {
      setLoading(false);
    }
  };

  const platformLabel = PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? platform;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label
            className="text-xs font-medium text-gray-500 block mb-1.5"
            htmlFor="search-platform"
          >
            Plataforma
          </label>
          <Select
            id="search-platform"
            value={platform}
            onChange={setPlatform}
            options={PLATFORM_OPTIONS}
            aria-label="Plataforma de busca"
            disabled={loading}
          />
        </div>

        <div>
          <label
            className="text-xs font-medium text-gray-500 block mb-1.5"
            htmlFor="search-keywords"
          >
            Palavras-chave{' '}
            <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <Input
            id="search-keywords"
            type="text"
            value={keywords}
            onChange={(e) => {
              setKeywords(e.target.value);
              if (error) setError(null);
            }}
            placeholder="ex: coach, professor, facilitador"
            disabled={loading}
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'search-keywords-error' : undefined}
          />
        </div>

        <div>
          <label
            className="text-xs font-medium text-gray-500 block mb-1.5"
            htmlFor="search-limit"
          >
            Limite
          </label>
          <Input
            id="search-limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            min={10}
            max={200}
            disabled={loading}
            aria-describedby="search-limit-hint"
          />
          <p id="search-limit-hint" className="text-xs text-gray-400 mt-0.5">
            Mín 10, máx 200
          </p>
        </div>
      </div>

      {error && (
        <p id="search-keywords-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
            Buscando {limit} prospects no {platformLabel}...
          </>
        ) : (
          'Buscar Prospects'
        )}
      </button>

      {result && !loading && (
        <p
          role="status"
          className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2"
        >
          ✓ {result.added ?? 0} leads adicionados, {result.duplicates ?? 0} duplicatas ignoradas.
        </p>
      )}
    </form>
  );
}
