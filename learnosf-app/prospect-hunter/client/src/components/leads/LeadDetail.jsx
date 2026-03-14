import { useState, useRef, useCallback, useEffect } from 'react';
import { Copy, Check, RefreshCw, Trash2, ExternalLink, MapPin, Users } from 'lucide-react';
import { Sheet } from '../ui/sheet';
import { Select } from '../ui/select';
import { ConfirmDialog } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import { updateLead, deleteLead, generateMessage, regenerateMessage } from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'Novo', label: 'Novo' },
  { value: 'Contatado', label: 'Contatado' },
  { value: 'Respondeu', label: 'Respondeu' },
  { value: 'Convertido', label: 'Convertido' },
  { value: 'Descartado', label: 'Descartado' },
];

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

export function LeadDetail({ lead, isOpen, onClose, onUpdate, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [notes, setNotes] = useState(lead?.notes ?? '');
  const [notesFeedback, setNotesFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const notesDebounceRef = useRef(null);

  // Stable refs to avoid stale closure in debounce
  const leadRef = useRef(lead);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { leadRef.current = lead; }, [lead]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  const handleCopyMessage = async () => {
    if (!lead?.mensagem_gerada) return;
    try {
      await navigator.clipboard.writeText(lead.mensagem_gerada);
    } catch {
      const el = document.createElement('textarea');
      el.value = lead.mensagem_gerada;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateMessage = async () => {
    setGeneratingMsg(true);
    try {
      const res = await generateMessage(lead.id);
      const updated = { ...lead, mensagem_gerada: res.data?.mensagem_gerada ?? res.mensagem_gerada };
      onUpdate(updated);
    } catch {
      // error handled silently; UI stays consistent
    } finally {
      setGeneratingMsg(false);
    }
  };

  const handleRegenerateMessage = async () => {
    setGeneratingMsg(true);
    try {
      const res = await regenerateMessage(lead.id);
      const updated = { ...lead, mensagem_gerada: res.data?.mensagem_gerada ?? res.mensagem_gerada };
      onUpdate(updated);
    } catch {
      // error handled silently
    } finally {
      setGeneratingMsg(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusFeedback('saving');
    try {
      await updateLead(lead.id, { status: newStatus });
      onUpdate({ ...lead, status: newStatus });
      setStatusFeedback('saved');
      setTimeout(() => setStatusFeedback(null), 2000);
    } catch {
      setStatusFeedback(null);
    }
  };

  const handleNotesChange = useCallback((value) => {
    setNotes(value);
    clearTimeout(notesDebounceRef.current);
    setNotesFeedback('saving');
    notesDebounceRef.current = setTimeout(async () => {
      try {
        await updateLead(leadRef.current.id, { notes: value });
        onUpdateRef.current({ ...leadRef.current, notes: value });
        setNotesFeedback('saved');
        setTimeout(() => setNotesFeedback(null), 2000);
      } catch {
        setNotesFeedback(null);
      }
    }, 1000);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteLead(lead.id);
      setConfirmDelete(false);
      onClose();
      onDelete(lead.id);
    } catch {
      setConfirmDelete(false);
    }
  };

  if (!lead) return null;

  const platform = PLATFORM_LABELS[lead.plataforma] ?? lead.plataforma;

  return (
    <>
      <Sheet isOpen={isOpen} onClose={onClose} title={lead.nome}>
        <div className="space-y-5">
          {/* Avatar + header */}
          <div className="flex items-start gap-3">
            {lead.foto_url ? (
              <img
                src={lead.foto_url}
                alt={`Foto de ${lead.nome}`}
                className="h-14 w-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <span className="text-xl text-gray-500 font-semibold">
                  {lead.nome?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{lead.nome}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {platform}
                </span>
              </div>
              {lead.username && (
                <p className="text-sm text-gray-500">@{lead.username}</p>
              )}
              {lead.url_perfil && (
                <a
                  href={lead.url_perfil}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"
                >
                  Ver perfil <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          {(lead.seguidores != null || lead.localizacao) && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {lead.seguidores != null && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  {lead.seguidores.toLocaleString('pt-BR')} seguidores
                </span>
              )}
              {lead.localizacao && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  {lead.localizacao}
                </span>
              )}
            </div>
          )}

          {/* Bio */}
          {lead.bio && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Bio</p>
              <p className="text-sm text-gray-700 leading-relaxed">{lead.bio}</p>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5" htmlFor="lead-status">
              Status
            </label>
            <div className="flex items-center gap-2">
              <Select
                id="lead-status"
                value={lead.status}
                onChange={handleStatusChange}
                options={STATUS_OPTIONS}
                aria-label="Status do lead"
                className="max-w-[200px]"
              />
              {statusFeedback === 'saved' && (
                <span
                  className="text-xs text-green-600 flex items-center gap-0.5"
                  aria-live="polite"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Salvo
                </span>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Mensagem gerada */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Mensagem gerada</p>
            {lead.mensagem_gerada ? (
              <div className="space-y-2">
                <div className="rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {lead.mensagem_gerada}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    aria-label={copied ? 'Mensagem copiada' : 'Copiar mensagem'}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
                      copied
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {copied ? (
                      <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Copiado!</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copiar Mensagem</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateMessage}
                    disabled={generatingMsg}
                    aria-label="Regenerar mensagem"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  >
                    <RefreshCw
                      className={cn('h-3.5 w-3.5', generatingMsg && 'animate-spin')}
                      aria-hidden="true"
                    />
                    {generatingMsg ? 'Gerando...' : 'Regenerar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 italic">Nenhuma mensagem gerada ainda.</p>
                <button
                  type="button"
                  onClick={handleGenerateMessage}
                  disabled={generatingMsg}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  {generatingMsg ? (
                    <><RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Gerando...</>
                  ) : (
                    'Gerar Mensagem'
                  )}
                </button>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Notas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-500" htmlFor="lead-notes">
                Notas pessoais
              </label>
              {notesFeedback && (
                <span className="text-xs text-gray-400" aria-live="polite">
                  {notesFeedback === 'saving' ? 'Salvando...' : '✓ Salvo'}
                </span>
              )}
            </div>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Adicione notas sobre este lead..."
              rows={3}
            />
          </div>

          <hr className="border-gray-100" />

          {/* Descartar */}
          <div>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Descartar Lead
            </button>
          </div>
        </div>
      </Sheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Descartar Lead"
        description="Tem certeza? Esta ação não pode ser desfeita."
        confirmLabel="Descartar"
        danger
      />
    </>
  );
}
