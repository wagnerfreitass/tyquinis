const multer = require('multer');
const path = require('path');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const BASE_URL = 'https://tyquinis-api.onrender.com';



app.use(cors());
app.use(express.json());
app.use('/img', express.static(__dirname + '/img'));
app.use(express.static('frontend'));

// Configuração do armazenamento de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'img/uploads'); // pasta onde serão salvas
  },
  filename: (req, file, cb) => {
    const nomeUnico = Date.now() + '-' + file.originalname;
    cb(null, nomeUnico);
  }
});

const upload = multer({ storage });



// Chave secreta para o JWT
const SECRET_KEY = 'tyquinis-super-secreta';

// Usuário fixo (pode depois colocar no .env ou num JSON)
const USUARIO_ADMIN = {
  email: 'admin@tyquinis.com.br',
  senha: '123456'
};

// Funções utilitárias para JSON
const lerProdutos = () => {
  const dados = fs.readFileSync('produtos.json');
  return JSON.parse(dados);
};

const salvarProdutos = (dados) => {
  fs.writeFileSync('produtos.json', JSON.stringify(dados, null, 2));
};

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    req.usuario = decoded;
    next();
  });
}

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === USUARIO_ADMIN.email && senha === USUARIO_ADMIN.senha) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '30m' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Rota para upload de imagem
app.post('/upload', authMiddleware, upload.single('imagem'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

  const caminhoAbsoluto = `${BASE_URL}/img/uploads/${req.file.filename}`;
  res.json({ caminho: caminhoAbsoluto });
});


// GET - Produtos (público)
app.get('/produtos', (req, res) => {
  const produtos = lerProdutos();
  res.json(produtos);
});

// POST - Adicionar produto (privado)
app.post('/produtos', authMiddleware, (req, res) => {
  const produtos = lerProdutos();
  const novoProduto = req.body;

  novoProduto.id = Date.now().toString();
  produtos.produtos.push(novoProduto);
  salvarProdutos(produtos);

  res.status(201).json({ message: 'Produto adicionado com sucesso!' });
});

// PUT - Editar produto (privado)
app.put('/produtos/:id', authMiddleware, (req, res) => {
  const produtos = lerProdutos();
  const id = req.params.id;
  const dadosAtualizados = req.body;

  const index = produtos.produtos.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });

  produtos.produtos[index] = { ...produtos.produtos[index], ...dadosAtualizados };
  salvarProdutos(produtos);

  res.json({ message: 'Produto atualizado com sucesso!' });
});

// DELETE - Remover produto (privado)
app.delete('/produtos/:id', authMiddleware, (req, res) => {
  const produtos = lerProdutos();
  const id = req.params.id;

  const novaLista = produtos.produtos.filter(p => p.id !== id);
  if (novaLista.length === produtos.produtos.length)
    return res.status(404).json({ error: 'Produto não encontrado' });

  salvarProdutos({ produtos: novaLista });
  res.json({ message: 'Produto removido com sucesso!' });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
