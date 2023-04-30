import { NextFunction, Request, Response } from 'express';
import { readFile, unlink } from 'fs/promises';
import { parse } from 'papaparse';
import path from 'path';
import { storageDir } from '../utils/handleFile';
import { UserSkillDb } from '../models/UserSkillsSchema';
import { ICsvSkillsErrors, ICsvValidation, IUserSkills } from '../types/user-skills';
import { validateHeader, validateRow, validateRowEmail, validateRowUrls } from '../utils/validateUserSkills';
import { handleEmail } from '../utils/handleEmail';
import { genToken } from '../utils/token';
import { UserDb } from '../models/UserSchema';
import { forgotRegisterEmailTemplate } from '../templates/forgotRegisterEmailTemplate';
import { ValidationError } from '../utils/handleError';

export const validateUserSkills = async (req: Request, res: Response, next: NextFunction) => {
  const csvFile = req.file;
  if (!csvFile) throw new ValidationError('No file found');

  try {
    const csv = await readFile(path.join(storageDir(), 'csv', csvFile.filename), 'utf8');
    const {
      meta: { fields },
      data,
    } = parse(csv, {
      header: true,
      skipEmptyLines: true,
    });

    const headers = validateHeader(fields).filter((header) => header !== null);

    if (headers.length > 0) {
      return res.status(200).send({ errors: headers });
    }

    const emailsFromCsv = data.map((data: IUserSkills) => data.email);

    const duplicateEmails: ICsvValidation[] = emailsFromCsv
      .map((email: string, i: number) => {
        const duplicate = emailsFromCsv.indexOf(email) !== i;
        return duplicate ? { row: i + 1, field: email, message: 'Ten email już istnieje' } : null;
      })
      .filter((data) => data !== null);

    const rowsFromCsv = await Promise.all(
      data.map(async (dataCsv: any, i) => {
        const errors = {} as ICsvSkillsErrors;
        const row = i + 1;

        errors.email = await validateRowEmail(dataCsv.email, i + 1, duplicateEmails);
        errors.courseCompletion = validateRow(dataCsv.courseCompletion, row);
        errors.courseEngagement = validateRow(dataCsv.courseEngagement, row);
        errors.teamProjectDegree = validateRow(dataCsv.teamProjectDegree, row);
        errors.projectDegree = validateRow(dataCsv.projectDegree, row);
        errors.bonusProjectUrls = validateRowUrls(dataCsv.bonusProjectUrls, row);

        return Object.values(errors).some((error) => error) ? errors : null;
      })
    );

    const rows = rowsFromCsv.filter((row) => row !== null);

    if (rows.length > 0) {
      return res.status(200).send({ errors: rows });
    }

    res.status(200).send({ ok: true, fileName: csvFile.filename });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new ValidationError('File not found');
    }
    if (csvFile) {
      await unlink(path.join(storageDir(), 'csv', csvFile.filename));
    }
    next(err);
  }
};

export const saveUserSkills = async (req: Request, res: Response, next: NextFunction) => {
  const { fileName } = req.body;

  try {
    const csvFile = await readFile(path.join(storageDir(), 'csv', fileName), 'utf8');
    const { data } = parse(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    const addSkills = await Promise.all(
      data.map(async (data: IUserSkills) => {
        const { email, projectDegree, courseCompletion, courseEngagement, teamProjectDegree, bonusProjectUrls } = data;

        const skills = new UserSkillDb({
          email,
          projectDegree,
          courseCompletion,
          courseEngagement,
          teamProjectDegree,
          bonusProjectUrls: bonusProjectUrls
            .toString()
            .split(',')
            .map((d) => d.trim()),
        });

        const user = await UserDb.findOne({ email, role: 'Kursant' });

        const token = genToken(user._id, '7d');
        user.token = token;
        user.save();

        const link = `${process.env.CORS_ORIGIN}/register/${user._id}/${token}`;

        await handleEmail({
          to: user.email,
          subject: 'Rejestracja użytkownika',
          html: forgotRegisterEmailTemplate(link),
        });

        return skills.save();
      })
    );

    if (data.length === addSkills.length) {
      await unlink(path.join(storageDir(), 'csv', fileName));
    } else {
      res.send({ message: 'Something went wrong, try again' });
    }

    res.status(201).send(addSkills);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new ValidationError('File not found');
    }
    if (fileName) {
      await unlink(path.join(storageDir(), 'csv', fileName));
    }
    next(err);
  }
};