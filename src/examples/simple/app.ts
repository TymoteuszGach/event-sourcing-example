import express, {Application} from 'express';
import {usersRouter} from "./users";

const app: Application = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/users", usersRouter);

export default app