import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';

// IMPORTANT: Make sure you actually export 'verifyToken' from this file
import { verifyToken } from './middleware/auth.js'; 

const app = express();

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    frameguard: false,
  })
);



// ---------------------------------------------------------------------------
// CORS (REST API)
// ---------------------------------------------------------------------------
const restOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use('/api', cors({
  origin: restOrigins,
  credentials: true,
}));

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests. Try again later.' },
  },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many auth attempts. Try again later.' },
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ---------------------------------------------------------------------------
// 1. Body parsing & compression (MUST BE BEFORE APOLLO)
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ---------------------------------------------------------------------------
// 2. Logging & Proxy
// ---------------------------------------------------------------------------
if (config.isDev) {
  app.use(morgan('dev'));
} else if (config.isProd) {
  app.use(morgan('combined'));
}
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// 3. GraphQL Data Layer (INIT AND MOUNT ONCE)
// ---------------------------------------------------------------------------
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    return {
      message: formattedError.message,
      code: error.originalError?.statusCode || 'INTERNAL_SERVER_ERROR',
    };
  },
});

await apolloServer.start();

// Handle CORS preflight for /graphql explicitly
const graphqlOrigins = [
  'https://studio.apollographql.com',
  'https://sandbox.embed.apollographql.com',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.options('/graphql', cors({
  origin: graphqlOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
  'Content-Type',
  'Authorization',
  'apollo-require-preflight',
  'x-apollo-operation-name',
  'sentry-trace',
  'baggage',
],
}));

app.use(
  '/graphql',
  cors({
    origin: graphqlOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
  'Content-Type',
  'Authorization',
  'apollo-require-preflight',
  'x-apollo-operation-name',
  'sentry-trace',
  'baggage',
],
  }),
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      let user = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          user = await verifyToken(token);
        } catch (err) {
          console.error("GraphQL Auth Error:", err.message);
        }
      }
      return { user };
    },
  })
);
// ---------------------------------------------------------------------------
// 4. API Routes (REST)
// ---------------------------------------------------------------------------
app.use('/api', routes);

// ---------------------------------------------------------------------------
// Static frontend (production)
// ---------------------------------------------------------------------------
if (config.isProd) {
  const distPath = resolve(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({ name: 'SaaS Backend API', version: '1.0.0', docs: '/api/health' });
  });

  // 404 fallback (dev only — prod handled by SPA catch-all above)
  app.all('*', (req, _res, next) => {
    next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
  });
}

// ---------------------------------------------------------------------------
// Global error handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorHandler);

export default app;
