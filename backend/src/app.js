import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    // Requests without an Origin (curl, the extension's background worker) are allowed.
    origin: (origin, callback) =>
      callback(null, !origin || env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin)),
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);
