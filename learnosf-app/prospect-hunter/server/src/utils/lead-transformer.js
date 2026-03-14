import { v4 as uuidv4 } from 'uuid';

function transformInstagram(rawProfile, keywords = []) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    nome: rawProfile.fullName || rawProfile.username || 'Sem nome',
    username: rawProfile.username || null,
    plataforma: 'instagram',
    bio: rawProfile.biography || null,
    url: rawProfile.url || `https://instagram.com/${rawProfile.username}`,
    foto_url: rawProfile.profilePicUrl || null,
    seguidores: rawProfile.followersCount || null,
    localizacao: rawProfile.city || rawProfile.location || null,
    keywords_busca: Array.isArray(keywords) ? keywords : [keywords],
    status: 'Novo',
    message: null,
    message_history: [],
    notes: null,
    data_captura: now,
    updated_at: now,
  };
}

function transformLinkedIn(rawProfile, keywords = []) {
  const now = new Date().toISOString();
  const nome = [rawProfile.firstName, rawProfile.lastName]
    .filter(Boolean)
    .join(' ') || rawProfile.publicIdentifier || 'Sem nome';

  return {
    id: uuidv4(),
    nome,
    username: rawProfile.publicIdentifier || null,
    plataforma: 'linkedin',
    bio: rawProfile.summary || rawProfile.headline || null,
    url: rawProfile.profileUrl || rawProfile.url || null,
    foto_url: rawProfile.profilePicUrl || null,
    seguidores: rawProfile.connectionsCount || null,
    localizacao: rawProfile.location || null,
    keywords_busca: Array.isArray(keywords) ? keywords : [keywords],
    status: 'Novo',
    message: null,
    message_history: [],
    notes: null,
    data_captura: now,
    updated_at: now,
  };
}

export function transformApifyResult(results, platform, keywords = []) {
  if (!Array.isArray(results)) return [];

  const transformer = platform === 'instagram' ? transformInstagram : transformLinkedIn;
  return results
    .filter(r => r && typeof r === 'object')
    .map(r => transformer(r, keywords));
}
