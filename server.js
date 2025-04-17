require('dotenv').config();
const express = require('express');
const path = require('path');
const os = require('os');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Função para obter IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'Não encontrado';
}

// Rota de execução
app.get('/executar', async (req, res) => {
  try {
    const ipLocal = getLocalIP();

    // IP público
    const response = await axios.get('https://ipinfo.io/ip');
    const ipPublico = response.data.trim();

    // Coleta de informações do sistema
    const hostname = os.hostname();
    const user = os.userInfo().username;
    const osType = `${os.type()} ${os.release()}`;
    const arch = os.arch();
    const uptimeSec = os.uptime();
    const uptimeFormatado = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}min`;
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB';
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB';
    const usedMem = (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2) + '%';
    const cpus = os.cpus();
    const numCPUs = cpus.length;
    const cpuModel = cpus[0].model;
    const cwd = process.cwd();
    const homeDir = os.homedir();
    const platform = os.platform();
    const nodeVersion = process.version;
    const datetime = new Date().toLocaleString();

    const dados = `
📌 DADOS DA MÁQUINA

🖥️ Nome da Máquina: ${hostname}
👤 Nome do Usuário: ${user}
🧠 Sistema Operacional: ${osType}
🏗️ Arquitetura: ${arch}
🕒 Uptime do Sistema: ${uptimeFormatado}
📅 Data e Hora: ${datetime}

🌐 IP Local: ${ipLocal}
🌍 IP Público: ${ipPublico}

💾 Memória Total: ${totalMem}
💤 Memória Livre: ${freeMem}
📊 Uso de Memória: ${usedMem}

🧮 CPUs: ${numCPUs}
⚙️ Modelo do Processador: ${cpuModel}

📁 Diretório Atual: ${cwd}
🏠 Diretório do Usuário: ${homeDir}
🧬 Plataforma: ${platform}
🔧 Node.js: ${nodeVersion}
`.trim();

    // Configuração de transporte do e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: '📬 Relatório de Informações da Máquina',
      text: dados,
    };

    // Envia e-mail
    await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso.');

    res.send('<h2>Email enviado com sucesso com todos os dados do sistema!</h2>');
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    res.status(500).send('Erro ao capturar os dados ou enviar o e-mail.');
  }
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${port}`);
});
