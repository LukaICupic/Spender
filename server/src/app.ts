import express, {Application, Request, Response} from 'express';
import billsRouter from './routes/bill';
import userRouter from './routes/user';
import categoryRouter from './routes/category';
import cookieParser from 'cookie-parser';
import { db } from './db';
import { migrate } from 'drizzle-orm/node-postgres/migrator'

if (!process.env.IS_DEV) {
  migrate(db, {
    migrationsFolder: "migrations",
  })
  .then(() => {
    console.info("DB migration complete");
  })
  .catch((error) => {
    const errorStr = `Failed to migrate database ${String(error)}`;
    console.error(errorStr);
    throw new Error(errorStr);
  });
}

const app:Application = express();

if(!process.env.IS_DEV){
  app.use(express.static('public'))
}

app.use(express.json());
app.use(cookieParser());

app.use(billsRouter);
app.use(userRouter);
app.use(categoryRouter);

app.listen(process.env.API_PORT ?? 8080, () => {
  return console.log(`Express is listening at ${process.env.API_BASE}:${process.env.API_PORT ?? 8080}`);
});