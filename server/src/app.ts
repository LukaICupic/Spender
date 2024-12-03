import express, {Application, Request, Response} from 'express';
import billsRouter from './routes/bills';
import userRouter from './routes/user';
import cors from 'cors';

const app:Application = express();

app.use(express.json());
app.use(cors({
  origin: `${process.env.API_BASE}:${process.env.API_PORT}`,
  credentials: true,
}));

app.use('/bills', billsRouter);
app.use(userRouter);

app.listen(process.env.API_PORT, () => {
  return console.log(`Express is listening at ${process.env.API_BASE}:${process.env.API_PORT}`);
});