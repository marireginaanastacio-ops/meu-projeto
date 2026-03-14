# Sistema de Prospecção Automatizada — Arquitetura Técnica

**Versão:** 1.0
**Data:** 2026-03-14
**Autor:** Aria (Architect Agent)
**PRD de referência:** `docs/prd/prospeccao-automatizada-PRD.md`
**Status:** Aprovado

---

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-03-14 | 1.0 | Arquitetura inicial | Aria (Architect) |

---

## 1. Visão Geral da Arquitetura

### Decisão Arquitetural

**Padrão:** Monorepo Fullstack Local — Express API + React SPA

**Justificativa:**
- Uso pessoal/single-user → sem necessidade de auth, multi-tenant ou cloud
- JSON local atende NFR4 (10k registros) com cache em memória
- Express + React é stack simples, bem documentada, sem overhead de Next.js (sem SSR necessário)
- Vite como bundler do frontend: dev server instantâneo, build otimizado

### Diagrama de Fluxo

```
[Usuário]
    │
    ▼
[React Dashboard] ──HTTP──► [Express API :3001]
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              [Apify SDK]    [Gemini SDK]    [JSON Store]
              (scraping)      (AI msgs)    data/leads.json
                    │               │        data/config.json
                    └───────────────┘
                            │
                       [leads.json]
```

### Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| Runtime | Node.js | 18+ | NFR6, LTS estável |
| Backend | Express | 4.x | Simples, sem overhead |
| Frontend | React + Vite | 18 + 5.x | SPA leve, dev rápido |
| UI Components | shadcn/ui + Tailwind | latest | Componentes prontos, design limpo |
| HTTP Client (front) | Fetch API nativo | — | Zero dependência |
| Apify | apify-client | 2.x | SDK oficial |
| Gemini | @google/generative-ai | 0.x | SDK oficial Google |
| ID generation | uuid | 9.x | IDs únicos para leads |
| Variáveis de ambiente | dotenv | 16.x | NFR1 (sem infra externa) |
| Testes | Vitest + Supertest | latest | Unificado, rápido |

---

## 2. Estrutura de Pastas

```
prospeccao-automatizada/
├── package.json              # Root — scripts de orquestração
├── .env                      # Credenciais (gitignored)
├── .env.example              # Template de variáveis
├── .gitignore
│
├── data/                     # Persistência local (gitignored)
│   ├── leads.json            # Base de leads [{ ...Lead }]
│   └── config.json           # Configurações do sistema
│
├── server/                   # Backend Express
│   ├── package.json
│   ├── src/
│   │   ├── index.js          # Entry point, app bootstrap
│   │   ├── routes/
│   │   │   ├── leads.routes.js
│   │   │   ├── prospects.routes.js
│   │   │   └── config.routes.js
│   │   ├── controllers/
│   │   │   ├── leads.controller.js
│   │   │   ├── prospects.controller.js
│   │   │   └── config.controller.js
│   │   ├── services/
│   │   │   ├── lead.service.js       # CRUD + filtros
│   │   │   ├── apify.service.js      # Busca e transformação
│   │   │   ├── gemini.service.js     # Geração de mensagens
│   │   │   └── config.service.js     # Templates e config
│   │   ├── middleware/
│   │   │   ├── error.middleware.js   # Error handler global
│   │   │   └── validate.middleware.js
│   │   └── utils/
│   │       ├── json-store.js         # R/W atômico do JSON
│   │       ├── lead-transformer.js   # Normaliza dados Apify
│   │       └── id.js                 # Geração de UUID
│   └── tests/
│       ├── unit/
│       │   ├── lead.service.test.js
│       │   ├── gemini.service.test.js
│       │   └── lead-transformer.test.js
│       └── integration/
│           ├── leads.api.test.js
│           └── prospects.api.test.js
│
└── client/                   # Frontend React + Vite
    ├── package.json
    ├── vite.config.js        # Proxy → server:3001
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx
        │   │   └── Header.jsx
        │   ├── leads/
        │   │   ├── LeadList.jsx
        │   │   ├── LeadCard.jsx
        │   │   ├── LeadDetail.jsx
        │   │   └── LeadFilters.jsx
        │   ├── dashboard/
        │   │   ├── MetricsPanel.jsx
        │   │   ├── StatCard.jsx
        │   │   └── PlatformChart.jsx
        │   ├── search/
        │   │   └── SearchForm.jsx
        │   └── ui/             # shadcn/ui customizados
        │       ├── Badge.jsx
        │       ├── Button.jsx
        │       └── StatusSelect.jsx
        ├── hooks/
        │   ├── useLeads.js     # Fetch + cache de leads
        │   ├── useStats.js     # Métricas
        │   └── useSearch.js    # Debounce de busca
        ├── services/
        │   └── api.js          # Wrapper fetch → /api/*
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── LeadsPage.jsx
        │   └── SettingsPage.jsx
        └── utils/
            └── formatters.js   # Datas, status labels, cores
```

---

## 3. Schema de Dados

### Lead (data/leads.json)

```json
{
  "id": "uuid-v4",
  "nome": "string",
  "username": "string | null",
  "plataforma": "instagram | linkedin",
  "bio": "string | null",
  "url": "string",
  "foto_url": "string | null",
  "seguidores": "number | null",
  "localizacao": "string | null",
  "keywords_busca": ["string"],
  "status": "Novo | Contatado | Respondeu | Convertido | Descartado",
  "message": "string | null",
  "message_history": [
    {
      "content": "string",
      "generated_at": "ISO date",
      "prompt_used": "string"
    }
  ],
  "notes": "string | null",
  "data_captura": "ISO date",
  "updated_at": "ISO date"
}
```

### Config (data/config.json)

```json
{
  "prompt_template": "string (com variáveis {{nome}}, {{bio}}, {{plataforma}})",
  "service_description": "string",
  "service_name": "string",
  "updated_at": "ISO date"
}
```

**Default do prompt_template:**
```
Você é um consultor especialista em experiências de aprendizagem.

Escreva uma mensagem de abordagem personalizada e genuína para {{nome}} no {{plataforma}}.

Sobre o lead:
- Nome: {{nome}}
- Bio: {{bio}}
- Plataforma: {{plataforma}}

Sobre o serviço:
{{service_description}}

Regras:
- Máximo 5 linhas
- Tom: profissional mas caloroso
- Mencione algo específico do perfil do lead
- Não seja genérico, não pareça spam
- Finalize com uma pergunta aberta
```

---

## 4. Contratos de API

### Base URL: `http://localhost:3001/api`

#### Leads

| Método | Endpoint | Descrição | Body / Query |
|--------|----------|-----------|--------------|
| GET | `/leads` | Listar leads | `?platform=instagram&status=Novo&search=maria&limit=50&offset=0` |
| GET | `/leads/stats` | Métricas | — |
| GET | `/leads/:id` | Lead por ID | — |
| PATCH | `/leads/:id` | Atualizar status/notes | `{ status?, notes? }` |
| DELETE | `/leads/:id` | Remover lead | — |

#### Prospecção

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| POST | `/prospects/search` | Buscar no Apify | `{ platform, keywords, limit? }` |

#### Mensagens

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| POST | `/leads/:id/generate-message` | Gerar mensagem | — |
| POST | `/leads/:id/regenerate-message` | Regenerar | `{ customPrompt? }` |

#### Configuração

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| GET | `/config/prompt-template` | Ler template | — |
| PUT | `/config/prompt-template` | Salvar template | `{ template, service_description?, service_name? }` |

#### Respostas padrão

```json
// Sucesso
{ "success": true, "data": {...} }

// Lista
{ "success": true, "data": [...], "total": 42, "limit": 50, "offset": 0 }

// Erro
{ "success": false, "error": "Mensagem descritiva", "code": "ERROR_CODE" }
```

---

## 5. Decisões Técnicas Chave

### 5.1 JSON Store — Leitura em Memória + Escrita Atômica

**Problema:** Múltiplas escritas concorrentes corrompem o JSON.

**Solução:** Cache em memória com fila de escritas sequenciais.

```javascript
// server/src/utils/json-store.js
class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.cache = null;           // Cache em memória
    this.writeQueue = Promise.resolve(); // Fila sequencial
  }

  async read() {
    if (!this.cache) {
      this.cache = JSON.parse(await fs.readFile(this.filePath, 'utf-8'));
    }
    return this.cache;
  }

  async write(data) {
    this.cache = data;
    // Escrita sequencial — nunca paralela
    this.writeQueue = this.writeQueue.then(() =>
      fs.writeFile(this.filePath, JSON.stringify(data, null, 2))
    );
    return this.writeQueue;
  }
}
```

**Por quê:** Atende NFR4 (10k registros carregam em ~20ms), previne race conditions sem precisar de banco de dados.

### 5.2 Apify Actors

| Plataforma | Actor ID | Campos extraídos |
|-----------|----------|-----------------|
| Instagram | `apify/instagram-profile-scraper` | username, fullName, biography, followersCount, profilePicUrl, url |
| LinkedIn | `proxycurl/linkedin-profile-scraper` | firstName, lastName, headline, summary, connectionsCount, profileUrl |

**Transformação padronizada** em `lead-transformer.js` normaliza os campos para o schema único de Lead.

### 5.3 Gemini — Modelo e Limites

- **Modelo:** `gemini-1.5-flash` (rápido, barato, adequado para texto curto)
- **Max tokens output:** 256 (mensagens curtas, max 5 linhas)
- **Timeout:** 8s com retry único em caso de falha transitória
- **Rate limit handling:** Fila com delay de 1s entre chamadas em batch

### 5.4 Frontend — Proxy Vite

```javascript
// client/vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

Elimina CORS em dev. Em prod (local), Express serve o build do React em `/`.

### 5.5 Deduplicação de Leads

Deduplicação por `url` do perfil no momento da inserção:

```javascript
// Ao inserir novo lead
const existing = leads.find(l => l.url === newLead.url);
if (existing) { duplicates++; continue; }
```

---

## 6. Arquitetura de Camadas — Backend

```
Request → Middleware (validate) → Router → Controller → Service → JsonStore/SDK
                                                ↓
                                         Response ← Service result
```

**Regras:**
- **Routes:** Apenas mapeamento de endpoints, sem lógica
- **Controllers:** Recebem req/res, chamam services, formatam resposta
- **Services:** Toda lógica de negócio. Não acessam req/res
- **Utils:** Funções puras sem estado (transformers, formatters)

---

## 7. Variáveis de Ambiente

```bash
# .env.example

# Servidor
PORT=3001
NODE_ENV=development

# Apify
APIFY_TOKEN=                    # Obrigatório para busca

# Google Gemini
GEMINI_API_KEY=                 # Obrigatório para mensagens

# Configuração do serviço (fallback se config.json não existir)
SERVICE_NAME="Criação de Experiências de Aprendizagem"
SERVICE_DESCRIPTION="Ajudo professores, facilitadores e coaches a estruturarem workshops, cursos e treinamentos com metodologias ativas que geram resultado real."
```

---

## 8. Estratégia de Testes

### Unitários (Vitest)

| Arquivo | O que testa |
|---------|-------------|
| `lead.service.test.js` | CRUD, filtros, deduplicação, stats |
| `gemini.service.test.js` | Geração de prompt, formatação, retry |
| `lead-transformer.test.js` | Normalização Instagram/LinkedIn → Lead |

### Integração (Supertest)

| Arquivo | O que testa |
|---------|-------------|
| `leads.api.test.js` | Todos os endpoints de leads (com JSON mock) |
| `prospects.api.test.js` | POST /search com Apify mockado |

**Mocks:**
- Apify: Jest mock retorna array de perfis fixos
- Gemini: Jest mock retorna mensagem fixa
- JsonStore: Usa arquivo temporário em `/tmp` nos testes

```json
// package.json (root) - scripts
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && node --watch src/index.js",
    "dev:client": "cd client && vite",
    "build": "cd client && vite build",
    "start": "cd server && NODE_ENV=production node src/index.js",
    "test": "cd server && vitest run",
    "test:watch": "cd server && vitest"
  }
}
```

---

## 9. Performance — Análise vs NFRs

| NFR | Requisito | Solução Arquitetural | Estimativa |
|-----|-----------|---------------------|------------|
| NFR2 | Dashboard < 2s para 1k leads | JSON em memória, sem DB roundtrip | ~50ms |
| NFR3 | Gemini < 5s por lead | gemini-flash + max_tokens=256 | ~1-3s |
| NFR4 | JSON suporta 10k registros | Cache em memória (~2MB) | ~20ms leitura |
| NFR6 | Windows/Mac/Linux | Node.js 18+ cross-platform | ✓ |

---

## 10. Fluxo de Inicialização

```
npm run dev
    │
    ├─► server/src/index.js
    │       ├── Carrega .env
    │       ├── Inicializa JsonStore (data/leads.json, data/config.json)
    │       ├── Cria arquivos se não existirem ([] e default config)
    │       ├── Registra routes
    │       ├── Registra error middleware
    │       └── Escuta em PORT=3001
    │
    └─► client/ (vite dev server :5173)
            ├── Proxy /api → :3001
            └── Serve React SPA
```

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Apify Actor mudança de schema | Média | Alto | lead-transformer.js isolado, fácil de atualizar |
| Gemini API quota/rate limit | Baixa | Médio | Retry com backoff, fila para batch |
| Corrupção do leads.json | Baixa | Alto | Escrita atômica + backup automático antes de write |
| Banimento de conta Instagram/LinkedIn | Alta (longo prazo) | Alto | Envio manual (design intencional do MVP) |
| JSON lento com >10k registros | Baixa no MVP | Médio | Cache em memória mitiga; migrar para SQLite se necessário |

---

## 12. Próximos Passos para @dev

### Ordem de implementação (sequencial por Epic):

**Epic 1:**
1. `npm init` + instalar dependências no root, server/, client/
2. Criar `utils/json-store.js` + testes unitários
3. Criar `utils/lead-transformer.js` para Instagram e LinkedIn
4. Implementar `services/lead.service.js` (CRUD completo)
5. Implementar `services/apify.service.js`
6. Criar routes + controllers de leads e prospects
7. Validar com Supertest

**Epic 2:**
1. Implementar `services/gemini.service.js`
2. Implementar `services/config.service.js`
3. Criar endpoints de geração/regeneração e config

**Epic 3:**
1. Setup React + Vite + shadcn/ui + Tailwind
2. Implementar `services/api.js` (fetch wrapper)
3. Construir hooks: useLeads, useStats, useSearch
4. Construir componentes: LeadList → LeadCard → LeadDetail
5. Construir MetricsPanel + PlatformChart
6. Integrar SearchForm com POST /api/prospects/search

### Handoff para @sm

Os 8 stories do PRD mapeiam 1:1 para esta arquitetura. Nenhuma story requer quebra adicional.

---

*— Aria, arquitetando o futuro 🏗️*
