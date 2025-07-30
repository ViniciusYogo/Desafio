const express = require('express');
const path = require('path')
const mysql = require('mysql2/promise');
const app = express();
const port = 5500;
// Diretório onde os arquivos HTML estão
const publicPath = path.join(__dirname, 'public');

app.use(express.json());




const conexao = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '102030',
  database: 'banco',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/cadastrarAluno', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inserirAluno', 'index.html'));
});

app.get('/visualizarAluno', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verAlunos', 'index.html'));
});




// Envio de alunos para o banco

// Rota de cadastro - Versão corrigida
app.post('/students/cadastro', async (req, res) => {

  const { nome, nota } = req.body;
  const notaNumber = parseFloat(nota);

  // Validações
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    console.log('Erro: Nome inválido');
    return res.status(400).json({
      status: 'error',
      error: 'Nome inválido'
    });
  }

  if (isNaN(notaNumber) || notaNumber < 0 || notaNumber > 10) {
    console.log('Erro: Nota inválida');
    return res.status(400).json({
      status: 'error',
      error: 'Nota deve estar entre 0 e 10'
    });
  }

  try {
    const [result] = await conexao.execute(
      'INSERT INTO alunos (nome, nota) VALUES (?, ?)',
      [nome.trim(), notaNumber]
    );


    return res.status(201).json({
      status: 'success',
      message: 'Aluno cadastrado com sucesso',
      data: {
        id: result.insertId,
        nome: nome.trim(),
        nota: notaNumber
      }
    });

  } catch (err) {
    console.error('Erro no banco de dados:', err);
    return res.status(500).json({
      status: 'error',
      error: 'Erro no banco de dados',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});



// API - Listar alunos
app.get('/students', async (req, res) => {
  try {
    const [alunos] = await conexao.query('SELECT id, nome, nota FROM alunos');
    res.json(alunos);
  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).json({
      error: 'Erro ao buscar alunos',
      details: err.message
    });
  }
});






app.use(express.static(publicPath));

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http: localhost:${port}`);
});

