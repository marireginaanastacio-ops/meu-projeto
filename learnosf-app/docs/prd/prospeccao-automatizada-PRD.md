# Sistema de Prospecção Automatizada — Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 2026-03-14
**Autor:** Morgan (PM Agent)
**Status:** Draft

---

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-03-14 | 1.0 | Versão inicial | Morgan (PM) |

---

## Goals

- Automatizar a busca e qualificação de prospects no Instagram e LinkedIn
- Gerar mensagens de abordagem personalizadas com IA (Gemini) para cada perfil
- Centralizar e organizar leads capturados em um dashboard web
- Reduzir o tempo manual de prospecção, aumentando volume de contatos qualificados
- Aumentar a taxa de conversão de prospects em clientes pagantes (ticket médio R$ 1.500)

---

## Background Context

O negócio oferece criação e estruturação de experiências de aprendizagem (workshops, cursos e treinamentos com metodologias ativas) para professores, facilitadores, consultores e coaches. O serviço tem ticket médio de R$ 1.500 e usa Instagram para atração de audiência e LinkedIn para posicionamento profissional e geração de clientes.

O processo de prospecção hoje é manual, lento e inconsistente — a persona precisa identificar potenciais clientes no Instagram e LinkedIn, analisar perfis individualmente e redigir mensagens de abordagem do zero. Isso limita o volume de prospecções semanais e reduz o tempo disponível para entrega do serviço.

O sistema automatiza esse ciclo completo: extração de perfis via Apify, armazenamento local em JSON, geração de mensagens personalizadas via Gemini API e visualização centralizada em dashboard web. O resultado esperado é mais prospecções qualificadas por semana com menos esforço operacional.

---

## Requirements

### Functional Requirements

- **FR1:** O sistema deve buscar perfis no Instagram e LinkedIn via Apify conforme critérios configuráveis (hashtags, palavras-chave, localização)
- **FR2:** O sistema deve armazenar os leads capturados em arquivo JSON local com os campos: nome, plataforma, bio, URL do perfil, data de captura, status
- **FR3:** O sistema deve usar a Gemini API para gerar mensagens de abordagem personalizadas com base no perfil do lead (nome, bio, plataforma)
- **FR4:** O dashboard web deve exibir a lista de leads com filtros por plataforma, status e data
- **FR5:** O dashboard deve permitir visualizar a mensagem gerada para cada lead
- **FR6:** O usuário deve poder marcar o status de cada lead (Novo, Contatado, Respondeu, Convertido, Descartado)
- **FR7:** O sistema deve permitir regenerar a mensagem de um lead com um novo prompt via Gemini
- **FR8:** O sistema deve exibir métricas básicas no dashboard: total de leads, leads por status, leads por plataforma

### Non-Functional Requirements

- **NFR1:** O sistema deve operar localmente sem necessidade de servidor ou banco de dados externo
- **NFR2:** O dashboard deve carregar em menos de 2 segundos para até 1.000 leads
- **NFR3:** A geração de mensagem via Gemini não deve ultrapassar 5 segundos por lead
- **NFR4:** O armazenamento em JSON deve suportar até 10.000 registros sem degradação de performance
- **NFR5:** O sistema deve ter interface em português brasileiro
- **NFR6:** O código deve ser executável em Windows/Mac/Linux com Node.js 18+

---

## User Interface Design Goals

### Overall UX Vision

Interface simples e funcional, focada em produtividade. O usuário deve conseguir em 3 cliques: ver seus leads, ler a mensagem gerada e registrar o status do contato. Sem complexidade desnecessária.

### Key Interaction Paradigms

- Lista de leads com cards expansíveis
- Filtros rápidos por plataforma e status (chips/badges)
- Ação de "copiar mensagem" em destaque para facilitar o envio manual
- Indicadores visuais de status por cor (verde = convertido, amarelo = contatado, etc.)

### Core Screens and Views

1. **Dashboard Principal** — métricas resumidas (total leads, por status, por plataforma)
2. **Lista de Leads** — tabela/cards com filtros e busca
3. **Detalhe do Lead** — perfil completo + mensagem gerada + histórico de status
4. **Configuração de Busca** — parâmetros para nova prospecção via Apify
5. **Configuração de Prompts** — customizar o template de mensagem do Gemini

### Accessibility

WCAG AA básico (contraste adequado, labels em formulários)

### Branding

Minimalista, tons neutros (branco/cinza), destaques em azul ou verde. Interface profissional sem excessos visuais.

### Target Device and Platforms

Web Responsive — uso primário em desktop, mas compatível com tablet

---

## Technical Assumptions

### Repository Structure

Monorepo — frontend e backend no mesmo repositório

### Service Architecture

Aplicação fullstack local com:
- **Backend:** Node.js + Express (API REST simples)
- **Frontend:** Next.js ou React (dashboard web)
- **Armazenamento:** JSON local (`data/leads.json`)
- **Integrações:** Apify Client SDK (scraping) + Google Generative AI SDK (Gemini)
- **Execução:** `npm run dev` para iniciar localmente

### Testing Requirements

Unit + Integration básico:
- Testes unitários para funções de transformação de dados e geração de mensagens
- Testes de integração para as chamadas Apify e Gemini (com mocks)
- Sem e2e no MVP

### Additional Technical Assumptions and Requests

- Credenciais armazenadas em `.env` (`APIFY_TOKEN`, `GEMINI_API_KEY`)
- Sem autenticação no MVP (uso pessoal/single user)
- Envio de mensagens NÃO automatizado (cópia manual para evitar banimento)
- Node.js 18+ como runtime mínimo
- Sem deploy em cloud no MVP (execução local)

---

## Epic List

### Epic 1: Fundação & Infraestrutura Core
Estabelecer o projeto, estrutura de pastas, configuração de variáveis de ambiente, servidor Express básico e pipeline de dados (Apify → JSON local).

### Epic 2: Geração de Mensagens com IA
Integrar Gemini API para gerar mensagens personalizadas por lead, com suporte a regeneração e templates de prompt configuráveis.

### Epic 3: Dashboard Web
Construir o dashboard React/Next.js com listagem de leads, filtros, visualização de mensagens, atualização de status e métricas.

---

## Epic Details

### Epic 1: Fundação & Infraestrutura Core

**Goal:** Criar a base técnica do projeto com estrutura de pastas, configuração de ambiente, servidor Express funcional e pipeline completo de busca de prospects via Apify com armazenamento em JSON local.

#### Story 1.1: Setup Inicial do Projeto

Como desenvolvedor,
Eu quero inicializar o repositório com estrutura de pastas, dependências e variáveis de ambiente,
Para ter uma base organizada para o desenvolvimento.

**Acceptance Criteria:**
1. Repositório inicializado com `package.json` e dependências instaladas (express, apify-client, @google/generative-ai, dotenv)
2. Arquivo `.env.example` criado com as variáveis: `APIFY_TOKEN`, `GEMINI_API_KEY`, `PORT`
3. Estrutura de pastas criada: `src/`, `data/`, `public/`, `tests/`
4. Arquivo `data/leads.json` inicializado com array vazio `[]`
5. `npm run dev` inicia o servidor sem erros

#### Story 1.2: Integração Apify — Busca de Prospects

Como usuário,
Eu quero configurar critérios de busca e disparar a coleta de prospects via Apify,
Para popular minha base de leads automaticamente.

**Acceptance Criteria:**
1. Endpoint `POST /api/prospects/search` aceita parâmetros: `platform` (instagram|linkedin), `keywords`, `limit`
2. Apify Actor é acionado com os parâmetros fornecidos
3. Resultados são transformados no formato padrão de lead (nome, plataforma, bio, url, data_captura, status: "Novo")
4. Leads são persistidos em `data/leads.json` sem duplicatas (deduplicação por URL)
5. Endpoint retorna `{ added: N, duplicates: M, total: T }`

#### Story 1.3: API REST de Leads

Como sistema,
Eu quero uma API para ler, atualizar e deletar leads do JSON local,
Para que o dashboard possa consumir e manipular os dados.

**Acceptance Criteria:**
1. `GET /api/leads` retorna todos os leads com suporte a query params: `platform`, `status`, `limit`, `offset`
2. `GET /api/leads/:id` retorna lead específico por ID
3. `PATCH /api/leads/:id` atualiza campos permitidos (status, notes)
4. `DELETE /api/leads/:id` remove lead do arquivo JSON
5. `GET /api/leads/stats` retorna contagens por status e por plataforma
6. Todos os endpoints retornam JSON com status HTTP correto

---

### Epic 2: Geração de Mensagens com IA

**Goal:** Integrar a Gemini API para gerar mensagens de abordagem personalizadas para cada lead, com suporte a templates de prompt configuráveis e regeneração de mensagens.

#### Story 2.1: Integração Gemini — Geração de Mensagem

Como usuário,
Eu quero que o sistema gere automaticamente uma mensagem personalizada para cada lead usando IA,
Para economizar tempo na criação de abordagens individuais.

**Acceptance Criteria:**
1. Endpoint `POST /api/leads/:id/generate-message` aciona a Gemini API
2. Prompt inclui: nome do lead, bio, plataforma, serviço oferecido (configurável via `.env` ou config)
3. Mensagem gerada é salva no campo `message` do lead no JSON
4. Geração completa em menos de 5 segundos
5. Em caso de erro da API, retorna mensagem de erro clara e não corrompe o JSON

#### Story 2.2: Regeneração e Templates de Prompt

Como usuário,
Eu quero poder regenerar a mensagem de um lead com instruções diferentes,
Para ajustar o tom ou abordagem quando necessário.

**Acceptance Criteria:**
1. Endpoint `POST /api/leads/:id/regenerate-message` aceita campo `customPrompt` opcional
2. Mensagem anterior é salva em `message_history` antes de ser substituída
3. `GET /api/config/prompt-template` retorna o template padrão atual
4. `PUT /api/config/prompt-template` salva novo template padrão em `data/config.json`
5. Template suporta variáveis: `{{nome}}`, `{{bio}}`, `{{plataforma}}`

---

### Epic 3: Dashboard Web

**Goal:** Construir o dashboard web em React com listagem de leads, filtros por plataforma e status, visualização de mensagens geradas, atualização de status e painel de métricas.

#### Story 3.1: Setup Frontend e Listagem de Leads

Como usuário,
Eu quero ver todos os meus leads em uma lista com informações básicas,
Para ter uma visão geral da minha base de prospects.

**Acceptance Criteria:**
1. Projeto React/Next.js configurado e integrado ao servidor Express
2. Página principal exibe lista de leads com: nome, plataforma (badge colorido), bio (truncada), status, data de captura
3. Lista atualiza ao recarregar a página
4. Estado vazio exibe mensagem "Nenhum lead encontrado" com call-to-action
5. Interface em português brasileiro

#### Story 3.2: Filtros e Busca

Como usuário,
Eu quero filtrar meus leads por plataforma, status e buscar por nome,
Para encontrar rapidamente os prospects que preciso.

**Acceptance Criteria:**
1. Filtro por plataforma: todos | Instagram | LinkedIn
2. Filtro por status: todos | Novo | Contatado | Respondeu | Convertido | Descartado
3. Campo de busca filtra por nome e bio em tempo real (debounce 300ms)
4. Filtros combinam (AND logic)
5. Contador exibe "X leads encontrados" atualizado dinamicamente

#### Story 3.3: Detalhe do Lead e Gestão de Status

Como usuário,
Eu quero ver os detalhes de um lead, ler a mensagem gerada e atualizar seu status,
Para gerenciar meu pipeline de prospecção.

**Acceptance Criteria:**
1. Clique em lead abre painel lateral (ou modal) com: dados completos, mensagem gerada, histórico de status
2. Botão "Copiar Mensagem" copia o texto para clipboard com feedback visual
3. Dropdown de status atualiza via `PATCH /api/leads/:id` sem recarregar página
4. Botão "Regenerar Mensagem" aciona `POST /api/leads/:id/regenerate-message`
5. Botão "Descartar Lead" pede confirmação antes de deletar

#### Story 3.4: Painel de Métricas e Nova Busca

Como usuário,
Eu quero ver métricas do meu pipeline e disparar novas buscas de prospects diretamente do dashboard,
Para monitorar resultados e alimentar minha base sem sair da interface.

**Acceptance Criteria:**
1. Cards de métricas exibem: Total de Leads, Novos, Contatados, Convertidos, Taxa de Conversão (%)
2. Gráfico simples de distribuição por plataforma (barra ou pizza)
3. Formulário de "Nova Busca" com campos: plataforma, palavras-chave, limite (default: 50)
4. Submit do formulário aciona `POST /api/prospects/search` e exibe progresso
5. Ao concluir a busca, lista de leads atualiza automaticamente

---

## Checklist Results Report

_A ser preenchido após execução do pm-checklist._

---

## Next Steps

### UX Expert Prompt

> Use este PRD como input para criar a especificação de UI/UX detalhada do Sistema de Prospecção Automatizada. Foque no dashboard web (Epic 3), defina o design system básico, fluxos de navegação e especificações de componentes para as 5 telas core descritas no documento.

### Architect Prompt

> Use este PRD como input para criar a arquitetura técnica do Sistema de Prospecção Automatizada. Valide as decisões técnicas (Node.js + Express + React + JSON local + Apify + Gemini), defina a estrutura de pastas detalhada, contratos de API, schema do JSON de leads e estratégia de testes. Considere os NFRs de performance (NFR2, NFR3, NFR4) nas decisões de arquitetura.

---

*— Morgan, planejando o futuro 📊*
