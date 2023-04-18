import express, {json} from 'express';
import 'express-async-errors';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from "helmet";
import bodyParser from 'body-parser';
import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";
// import {v4 as uuid} from "uuid";
import {handleError} from "./utils/handleError";
import {homeRouter} from "./routers/home.router";

dotenv.config();
const app = express();
app.use(json());
app.use(bodyParser.urlencoded({extended: true}));
// const secretKey = process.env.SECRET_KEY;
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(helmet());

app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10000,
}));
app.use('/', homeRouter);

app.use(handleError);

app.listen(3001, '0.0.0.0', () => {
    console.log('Listening on http://localhost:3001');
})
