# QA Fix Request — Prospect Hunter Backend

**Criado por:** Quinn (@qa)
**Data:** 2026-03-14
**Stories afetadas:** 2.1 (CONCERNS), 2.2 (CONCERNS)
**Total de testes passando:** 54/54 ✅

---

## Fix #1 — HIGH | `generate-message.controller.js`

**Problema:** `getById()` e `update()` chamados fora de try-catch. Se o filesystem lançar (ex: disco cheio, permissão), resulta em unhandled promise rejection ao invés de resposta 500 estruturada.

**Arquivo:** `src/controllers/generate-message.controller.js`

**Padrão correto** (já usado em `leads.controller.js`):
```js
export async function generateMessageHandler(req, res, next) {
  const { id } = req.params;

  let lead;
  try {
    lead = await getById(id);
  } catch (err) {
    return next(err);
  }

  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado', code: 'NOT_FOUND' });
  }

  let message;
  try {
    message = await generateMessage(lead);
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message, code: err.code || 'GEMINI_ERROR' });
  }

  try {
    const now = new Date().toISOString();
    const updatedLead = await update(id, { message, updated_at: now });
    return res.json({ success: true, data: { id: updatedLead.id, message: updatedLead.message } });
  } catch (err) {
    return next(err);
  }
}
```

---

## Fix #2 — HIGH | `regenerate-message.controller.js`

**Problema:** `getById()`, `getPromptTemplate()` e `update()` sem try-catch.

**Arquivo:** `src/controllers/regenerate-message.controller.js`

Envolver cada operação de I/O em try-catch com `next(err)` — seguindo o mesmo padrão do Fix #1.

---

## Fix #3 — MEDIUM | Extrair lógica Gemini customPrompt para o service

**Problema:** `regenerate-message.controller.js` (L35-48) instancia `GoogleGenerativeAI` diretamente, duplicando lógica de `gemini.service.js`.

**Solução:** Adicionar função em `gemini.service.js`:
```js
export async function generateCustomMessage(customPrompt) {
  const model = initModel();
  return callGeminiWithTimeout(model, customPrompt);
}
```

No controller, substituir o bloco inline por:
```js
if (customPrompt) {
  message = await generateCustomMessage(customPrompt);
} else {
  message = await generateMessage(lead);
}
```

Atualizar o mock nos testes de integração para incluir `generateCustomMessage`.

---

## Fix #4 — MEDIUM | Eliminar configStore duplicado em `gemini.service.js`

**Problema:** `gemini.service.js` cria seu próprio `JsonStore` para `config.json`. Após PUT /api/config/prompt-template, o cache do service Gemini não é invalidado — template atualizado não é usado até restart.

**Solução:** Em `gemini.service.js`, remover:
```js
// REMOVER estas linhas:
const configStore = new JsonStore(CONFIG_PATH);
```

E importar de `config.service.js`:
```js
import { configStore } from './config.service.js';
```

Em `buildPrompt()`, continuar usando `configStore.read()` normalmente — agora é a mesma instância com cache compartilhado.

---

## Fix #5 — LOW / TECH DEBT | `error.middleware.js`

**Problema:** Mensagens de erro internas do SDK Gemini/Apify expostas ao cliente em produção.

**Solução sugerida** (pode ir como tech debt se não for prioridade agora):
```js
export function errorMiddleware(err, req, res, next) {
  console.error(`[Error] ${err.message}`, err.code || '', err.stack || '');
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.statusCode || 500).json({
    success: false,
    error: isProd && !err.code ? 'Erro interno do servidor' : (err.message || 'Erro interno do servidor'),
    code: err.code || 'INTERNAL_ERROR',
  });
}
```

---

## Critérios de Aceite para Re-Review

- [ ] Fix #1 aplicado — `generate-message.controller.js` com try-catch em todos awaits
- [ ] Fix #2 aplicado — `regenerate-message.controller.js` com try-catch em todos awaits
- [ ] Fix #3 aplicado — `generateCustomMessage()` em `gemini.service.js`, controller limpo
- [ ] Fix #4 aplicado — `configStore` único compartilhado
- [ ] Todos os 54 testes continuam passando
- [ ] Testes de integração atualizados para incluir mock de `generateCustomMessage`

**Após correções:** Ativar `@qa *review 2.1` e `@qa *review 2.2` para re-revisão.

— Quinn, guardião da qualidade 🛡️
