// api/login.js
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'tyquinis-super-secreta';
const USUARIO_ADMIN = {
  email: 'admin@tyquinis.com.br',
  senha: '123456'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, senha } = req.body;

  if (email === USUARIO_ADMIN.email && senha === USUARIO_ADMIN.senha) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '30m' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Credenciais inválidas' });
}
