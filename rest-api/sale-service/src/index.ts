import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandlingMiddleware } from './middleware/error-handler.midleware'
import RabbitMQService from './service/utils/rabbitmq.service';
import session from 'express-session';
import { env } from './config/env';
//import elasticSearch from './service/utils/elasticSearch.service';

const app = express();

app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true } -> production -> HTTPS
  cookie: { secure: false } // -> development -> HTTP
}))

app.use(cors());
app.use(express.json());

//health check
app.get('/ping', (_req, res) => res.json({ message: 'pong' }));

app.use(errorHandlingMiddleware);

const PORT = env.PORT || 4000;

RabbitMQService.getInstance().then(() => {
  console.log('Connected to RabbitMQ');
}).catch((error) => {
  console.error('Failed to connect to RabbitMQ:', error);
});

// elasticSearch.ping().then(() => {
//   console.log('Connected to ElasticSearch');
// }).catch((error) => {
//   console.error('Failed to connect to ElasticSearch:', error);
// });

app.listen(PORT, () => console.log(`API running http://localhost:${PORT}`));
