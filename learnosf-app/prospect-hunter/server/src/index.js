import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import leadsRoutes from './routes/leads.routes.js';
import prospectsRoutes from './routes/prospects.routes.js';
import configRoutes from './routes/config.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'prospect-hunter-api', timestamp: new Date().toISOString() });
});

app.use('/api/leads', leadsRoutes);
app.use('/api/prospects', prospectsRoutes);
app.use('/api/config', configRoutes);

// Error middleware deve ser o último
app.use(errorMiddleware);

// Só inicia o servidor quando executado diretamente (não quando importado por testes)
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain || process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[Server] Prospect Hunter API rodando em http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
