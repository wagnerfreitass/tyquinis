// api/produtos/index.js
import supabase from '../../supabaseClient.js';
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
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
    return res.json({ produtos: data });
  }

  if (req.method === 'POST') {
    const usuario = verificarToken(req);
    if (!usuario) return res.status(403).json({ error: 'Token inválido' });

    const novoProduto = { ...req.body }; // não incluir ID, o Supabase já gera
    const { error } = await supabase.from('produtos').insert(novoProduto);

    if (error) {
      console.error('Erro ao inserir produto:', error);
      return res.status(500).json({ error: 'Erro ao inserir produto', detalhes: error.message });
    }

    return res.status(201).json({ message: 'Produto adicionado com sucesso!' });
  }

  return res.status(405).end();
}
