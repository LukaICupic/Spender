import express, {Application, Request, Response} from 'express';
import billsRouter from './routes/bills';
import userRouter from './routes/user';
import cors from 'cors';

const app:Application = express();
const port:number = 5000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use('/bills', billsRouter);
app.use(userRouter);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});