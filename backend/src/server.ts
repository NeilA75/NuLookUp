import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './router';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'OPTIONS'],
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  res.type('application/json');
  next();
});

app.use('/api', router);

const port = process.env.BACKEND_PORT
  ? Number(process.env.BACKEND_PORT)
  : process.env.PORT
  ? Number(process.env.PORT)
  : 3001;

app.listen(port, () => {
  console.log(`NuLookUp backend listening on port ${port} — reload ${new Date().toISOString()}`);
});
