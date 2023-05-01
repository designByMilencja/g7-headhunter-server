export interface IAdmin {
  email: string;
  password: string;
  token?: string | null;
  role: 'Admin' | 'Kursant' | 'HR';
}

export type AdminRespons = Omit<IAdmin, 'password' | 'token'>;
