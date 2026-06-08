import 'dotenv/config';
import express, { json, urlencoded, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from "./routes/index.js";
import validateEnvironment from "./config/environment.js";
import { requestLoggingMiddleware, requestIdMiddleware } from "./middlewares/logging.middleware.js";
import { securityHeadersMiddleware, requestSizeLimitMiddleware, rateLimitingStatusMiddleware } from "./middlewares/security.middleware.js";

const app = express();
validateEnvironment();

app.use(cors({ origin: true, credentials: true }));
app.use(json({ limit: '100kb' }));
app.use(urlencoded({ extended: false, limit: '100kb' }));
app.use(requestLoggingMiddleware);
app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);
app.use(requestSizeLimitMiddleware);
app.use(rateLimitingStatusMiddleware);

app.use('/api', router);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
  next();
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`ApexTrack backend listening on http://localhost:${port}`);
});
