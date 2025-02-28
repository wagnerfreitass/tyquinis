const express = require('express');
const app = express();
const port = 3000;

// Servir arquivos estáticos da pasta atual (ou ajuste para a pasta do seu projeto)
app.use(express.static(__dirname));

// Inicia o servidor "node server.js"
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});"'"