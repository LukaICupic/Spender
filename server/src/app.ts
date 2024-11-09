import express, {Application, Request, Response} from 'express';
import billsRouter from './routes/bills';

const app:Application = express();
const port:number = 5000;

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!');
});

app.use('/bills', billsRouter);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});