import { Request, Response } from 'express';
import { getAuthContext } from './auth.middleware';
import { getCurrentUser, loginUser, registerUser } from './auth.service';

export async function registerController(req: Request, res: Response) {
  const result = await registerUser({
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({ data: result });
}

export async function loginController(req: Request, res: Response) {
  const result = await loginUser({
    email: req.body.email,
    password: req.body.password,
  });

  res.json({ data: result });
}

export async function meController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const user = await getCurrentUser(auth.userId);

  res.json({ data: user });
}
