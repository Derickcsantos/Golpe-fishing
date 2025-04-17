const express = require('express');
const os = require('os');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Servidor funcionando. Acesse <code>/executar</code> para enviar dados por e-mail.</h1>');
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

    // Outras informações
    const nomeMaquina = os.hostname();
    const nomeUsuario = os.userInfo().username;
    const sistemaOperacional = `${os.type()} ${os.release()}`;
    const arquitetura = os.arch();
    const uptime = os.uptime();
    const uptimeFormatado = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}min`;
    const totalMemoria = (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB';
    const memoriaLivre = (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB';
    const usoMemoria = (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2) + '%';
    const cpus = os.cpus();
    const numCPUs = cpus.length;
    const modeloCPU = cpus[0].model;
    const diretorioAtual = process.cwd();
    const diretorioHome = os.homedir();
    const plataforma = os.platform();
    const versaoNode = process.version;
    const dataHora = new Date().toLocaleString();

    const dados = `
📌 DADOS DA MÁQUINA

🖥️ Nome da Máquina: ${nomeMaquina}
👤 Nome do Usuário: ${nomeUsuario}
🧠 Sistema Operacional: ${sistemaOperacional}
🏗️ Arquitetura: ${arquitetura}
🕒 Uptime do Sistema: ${uptimeFormatado}
📅 Data e Hora: ${dataHora}

🌐 IP Local: ${ipLocal}
🌍 IP Público: ${ipPublico}

💾 Memória Total: ${totalMemoria}
💤 Memória Livre: ${memoriaLivre}
📊 Uso de Memória: ${usoMemoria}

🧮 CPUs: ${numCPUs}
⚙️ Modelo do Processador: ${modeloCPU}

📁 Diretório Atual: ${diretorioAtual}
🏠 Diretório do Usuário: ${diretorioHome}
🧬 Plataforma: ${plataforma}
🔧 Node.js: ${versaoNode}
`.trim();

    // Envio do email
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
      subject: '📬 Relatório de Informações da Máquina',
      text: dados,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso.');
    res.send('<h2>Email enviado com sucesso com todos os dados do sistema!</h2>');
  } catch (err) {
    console.error('❌ Erro:', err);
    res.status(500).send('Erro ao capturar os dados ou enviar o e-mail.');
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
