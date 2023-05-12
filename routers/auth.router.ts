import { Router } from 'express';
import { changePassword, forgotPassword, login, logout, updatePassword } from '../controllers/authController';
import { verifyCookie } from '../middlewares/auth';

export const authRouter = Router();

authRouter
  .post('/login', login)
  .get('/logout', verifyCookie, logout)
  .post('/reset-password', forgotPassword)
  .patch('/update-password', updatePassword)
  .patch('/change-password', verifyCookie, changePassword);
