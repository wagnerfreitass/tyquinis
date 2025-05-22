// api/produtos/[id].js
import supabase from '../../supabaseClient.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'tyquinis-super-secreta';

function verificarToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const id = req.query.id;
  const usuario = verificarToken(req);
  if (!usuario) return res.status(403).json({ error: 'Token inválido' });

  if (req.method === 'PUT') {
    const { error } = await supabase.from('produtos').update(req.body).eq('id', id);
    if (error) return res.status(500).json(error);
    return res.json({ message: 'Produto atualizado com sucesso!' });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) return res.status(500).json(error);
    return res.json({ message: 'Produto removido com sucesso!' });
  }

  return res.status(405).end();
}
