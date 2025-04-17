const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Servir o arquivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para executar o arquivo .bat
app.get('/executar-bat', (req, res) => {
  // Executa o arquivo .bat
  exec('capturarIP.bat', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao executar .bat: ${error.message}`);
      return res.status(500).send('Erro ao executar o arquivo .bat');
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send('Erro no processo de execução');
    }
    console.log(`stdout: ${stdout}`);
    res.send('Arquivo .bat executado com sucesso! Email enviado.');
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
