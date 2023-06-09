import * as yup from 'yup';
import { ContractType, TypeWork } from '../types';

export const registerUserSchema = yup.object().shape({
  email: yup.string().email('Proszę podać poprawny adres email.').required('Email jest wymagany do rejestracji.'),
  phone: yup.string().notRequired(),
  firstName: yup.string().required('Imię jest wymagane do rejestracji.'),
  lastName: yup.string().required('Nazwisko jest wymagane do rejestracji.'),
  githubUsername: yup.string().required('Nazwa użytkowania github jest wymagane do rejestracji.'),
  portfolioUrls: yup.array().of(yup.string().url('Nie poprawny adres url do Twojego portfolio')).notRequired(),
  projectUrls: yup
    .array()
    .of(yup.string().matches(/^https?:\/\/(www\.)?github\.com\/.*$/, 'Nie poprawny adres url projektu końcowego'))
    .required()
    .min(2, 'Wymagane jest podanie adresów do projektu na FE i BE')
    .required('Dodaj adresy url do projektu końcowego'),
  bio: yup.string().notRequired(),
  expectedTypeWork: yup
    .string()
    .oneOf(Object.values(TypeWork), 'Nie prawidłowe dane w polu oczekiwane miejsce pracy.')
    .required('Wybierz preferowane miejsc pracy'),
  targetWorkCity: yup.string().notRequired(),
  expectedContractType: yup
    .string()
    .oneOf(Object.values(ContractType), 'Nie prawidłowe dane w polu typ kontraktu')
    .required('Wybierz preferowane typ kontraktu'),
  expectedSalary: yup.string().notRequired(),
  canTakeApprenticeship: yup
    .string()
    .oneOf(['TAK', 'NIE'], 'Wybierz prawidłowe dane: "TAK" lub "NIE"')
    .required('Wybierz czy zgadzasz się na odbycie bezpłatnego stażu.'),
  monthsOfCommercialExp: yup
    .number()
    .min(0, 'Minimalna liczba miesięcy doświadczenia komercyjnego to 0')
    .integer('Tylko liczby naturalne w polu ilość miesięcy doświadczenia komercyjnego.')
    .typeError('Dozwolone są tylko liczny naturalne w polu ilość miesięcy doświadczenia komercyjnego')
    .notRequired(),
  education: yup.string().notRequired(),
  workExperience: yup.string().notRequired(),
  courses: yup.string().notRequired(),
});
