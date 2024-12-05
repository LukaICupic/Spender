import express, {Application, Request, Response} from 'express';
import billsRouter from './routes/bill';
import userRouter from './routes/user';
import categoryRouter from './routes/category';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app:Application = express();

app.use(express.json());
app.use(cors({
  origin: `${process.env.API_BASE}:${process.env.CLIENT_PORT}`,
  credentials: true,
}));
app.use(cookieParser());

app.use(billsRouter);
app.use(userRouter);
app.use(categoryRouter);

app.listen(process.env.API_PORT, () => {
  return console.log(`Express is listening at ${process.env.API_BASE}:${process.env.API_PORT}`);
});