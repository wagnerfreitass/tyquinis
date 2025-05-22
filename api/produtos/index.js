// api/produtos/index.js
import { supabase } from '../../supabaseClient.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'tyquinis-super-secreta';

function verificarToken(req) {
  const token = req.headers.authorization;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) return res.status(500).json(error);
    return res.json({ produtos: data });
  }

  if (req.method === 'POST') {
    const usuario = verificarToken(req);
    if (!usuario) return res.status(403).json({ error: 'Token inválido' });

    const novoProduto = { ...req.body, id: Date.now().toString() };
    const { error } = await supabase.from('produtos').insert(novoProduto);
    if (error) return res.status(500).json(error);
    return res.status(201).json({ message: 'Produto adicionado com sucesso!' });
  }

  return res.status(405).end();
}
