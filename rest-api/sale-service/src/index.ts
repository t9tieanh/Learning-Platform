import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandlingMiddleware } from './middleware/error-handler.midleware'
import RabbitMQService from './service/utils/rabbitmq.service';
//import elasticSearch from './service/utils/elasticSearch.service';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandlingMiddleware);

const PORT = process.env.PORT || 4000;

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
