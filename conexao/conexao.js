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

app.post('/students', (req, res) => {
  const { nome, nota } = req.body;

  const notaNumber = parseFloat(nota);


  // Validações
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ error: 'Nome inválido' });
  }


  if (notaNumber < 0 || notaNumber > 10) {
    return res.status(400).json({ error: 'Nota deve estar entre 0 e 10' });
  }

  conexao.query(
    'INSERT INTO alunos (nome, nota) VALUES (?, ?)',
    [nome.trim(), notaNumber],
    //err -> msg erro result-> sucesso
    (err, result) => {
      if (err) return res.status(500).send('Erro no banco de dados');
      res.status(201).json({
        success: true,
        message: "Aluno cadastrado com sucesso",
        alunoId: result.insertId
      });
    }
  );
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

