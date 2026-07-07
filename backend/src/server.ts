import 'dotenv/config';
import express, { json, urlencoded, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import router from "./routes/index.js";
import validateEnvironment from "./config/environment.js";
import { requestLoggingMiddleware, requestIdMiddleware } from "./middlewares/logging.middleware.js";
import { securityHeadersMiddleware, requestSizeLimitMiddleware, rateLimitingStatusMiddleware } from "./middlewares/security.middleware.js";
import { startPostbackWorker } from "./workers/postback-worker.js";

const app = express();
validateEnvironment();

app.use(cors({ origin: true, credentials: true }));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLoggingMiddleware);
app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);
app.use(requestSizeLimitMiddleware);
app.use(rateLimitingStatusMiddleware);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api-docs', express.static(path.join(process.cwd(), 'public/api-docs')));
app.use('/api', router);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const pgErr = err && typeof err === 'object' && 'code' in err
    ? err as { code: string; message?: string; table?: string; column?: string }
    : null;

  if (pgErr?.code === '42P01') {
    // Relation (table) not found — extract name from message: relation "foo" does not exist
    const match = pgErr.message?.match(/"([^"]+)"/);
    const table = match?.[1] ?? pgErr.table ?? 'unknown';
    res.status(500).json({ message: `Database table "${table}" does not exist. Run: npm run migrate` });
    return;
  }

  if (pgErr?.code === '42703') {
    // Column not found — missing migration (e.g. advertiser_payout / affiliate_payout)
    const match = pgErr.message?.match(/"([^"]+)"/);
    const col = match?.[1] ?? pgErr.column ?? 'unknown';
    res.status(500).json({ message: `Database column "${col}" does not exist. Run: npm run migrate` });
    return;
  }

  res.status(500).json({ message: 'Internal Server Error' });
  next();
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`ApexTrack backend listening on http://localhost:${port}`);
  startPostbackWorker();
});
