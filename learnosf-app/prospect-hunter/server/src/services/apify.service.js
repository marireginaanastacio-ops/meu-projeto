import { ApifyClient } from 'apify-client';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../utils/json-store.js';
import { transformApifyResult } from '../utils/lead-transformer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../../../..', 'data/leads.json');

const ACTOR_IDS = {
  instagram: 'apify/instagram-profile-scraper',
  linkedin: 'proxycurl/linkedin-profile-scraper',
};

const leadsStore = new JsonStore(DATA_PATH);

function buildInput(platform, keywords, limit = 50) {
  if (platform === 'instagram') {
    return {
      usernames: [],
      resultsType: 'details',
      resultsLimit: Math.min(limit, 200),
      searchType: 'hashtag',
      searchLimit: 5,
      hashtags: keywords.split(',').map(k => k.trim()),
    };
  }
  return {
    searchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}`,
    maxResults: Math.min(limit, 200),
  };
}

export async function searchProspects({ platform, keywords, limit = 50 }) {
  if (!ACTOR_IDS[platform]) {
    throw Object.assign(new Error(`Plataforma inválida: ${platform}`), { code: 'INVALID_PLATFORM' });
  }

  const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

  let rawResults;
  try {
    const run = await client.actor(ACTOR_IDS[platform]).call(buildInput(platform, keywords, limit));
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    rawResults = items;
  } catch (err) {
    throw Object.assign(
      new Error(`Apify Actor falhou: ${err.message}`),
      { code: 'APIFY_ERROR', originalError: err }
    );
  }

  const newLeads = transformApifyResult(rawResults, platform, keywords.split(',').map(k => k.trim()));

  const existingLeads = await leadsStore.read();
  const existingUrls = new Set(existingLeads.map(l => l.url).filter(Boolean));

  const uniqueLeads = newLeads.filter(l => l.url && !existingUrls.has(l.url));
  const duplicates = newLeads.length - uniqueLeads.length;

  const updatedLeads = [...existingLeads, ...uniqueLeads];
  await leadsStore.write(updatedLeads);

  return {
    added: uniqueLeads.length,
    duplicates,
    total: updatedLeads.length,
  };
}
