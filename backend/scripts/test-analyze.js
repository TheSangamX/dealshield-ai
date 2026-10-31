// End-to-end check for the analyze pipeline. Run: npm run test:analyze
//   1. Real server: GET /api/health → 200, POST /api/analyze without a token → 401
//   2. Analyze route over HTTP (validation → Groq → JSON) → 200 with all three strategies.
//      Auth and quota are skipped here because they need a signed-in Supabase user;
//      test those from the extension.
import express from 'express';
import { app } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { validateBody } from '../src/middleware/validate.js';
import { generateNegotiationStrategies, NegotiationStrategiesSchema } from '../src/services/groq.service.js';
import { analyzeRequestSchema } from '../src/routes/analyze.routes.js';

const SAMPLE_EMAIL = `Hi,

Thanks for the updated proposal. We like the platform, but $48/seat is above what we budgeted.
Another vendor quoted us $39/seat for a similar package.

If you can match that and include onboarding, we can sign before the end of the quarter.

Best,
Jordan`;

let failures = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

const listen = (server) =>
  new Promise((resolve) => {
    const s = server.listen(0, () => resolve(s));
  });

// 1. Real app
const realServer = await listen(app);
const realUrl = `http://127.0.0.1:${realServer.address().port}`;

const health = await fetch(`${realUrl}/api/health`);
check('GET /api/health → 200', health.status === 200, `got ${health.status}`);

const noToken = await fetch(`${realUrl}/api/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ emailText: SAMPLE_EMAIL }),
});
const noTokenBody = await noToken.json();
check(
  'POST /api/analyze without token → 401',
  noToken.status === 401,
  `got ${noToken.status} ${noTokenBody.error?.code ?? ''}`,
);
realServer.close();

// 2. Analyze route without auth/quota
if (!process.env.GROQ_API_KEY) {
  check('POST analyze → 200 from Groq', false, 'GROQ_API_KEY is not set in backend/.env');
} else {
  const testApp = express();
  testApp.use(express.json());
  testApp.post('/analyze', validateBody(analyzeRequestSchema), async (req, res) => {
    res.json({ data: await generateNegotiationStrategies(req.body) });
  });
  testApp.use(errorHandler);

  const testServer = await listen(testApp);
  const started = Date.now();
  const res = await fetch(`http://127.0.0.1:${testServer.address().port}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailText: SAMPLE_EMAIL }),
  });
  const body = await res.json();
  testServer.close();

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  check('POST analyze → 200 from Groq', res.status === 200, `got ${res.status} in ${seconds}s ${body.error?.code ?? ''}`);
  if (res.status === 200) {
    check('Response has firmOffer / creativeTradeoff / urgencyDraft', NegotiationStrategiesSchema.safeParse(body.data).success);
    console.log('\n' + JSON.stringify(body.data, null, 2));
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
