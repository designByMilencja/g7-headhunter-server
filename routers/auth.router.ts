import { Router } from 'express';
import { forgotPassword, login, logout, register } from '../controllers/authController';
import { verifyCookie } from '../middlewares/auth';
export const authRouter = Router();

authRouter
  .post('/register', register)
  .post('/login', login)
  .get('/logout', verifyCookie, logout)
  .post('/reset', forgotPassword);
