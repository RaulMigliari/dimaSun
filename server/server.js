require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware para receber JSON
app.use(express.json());

// Servir os arquivos estáticos no diretório "client"
app.use(express.static(path.join(__dirname, '../client')));

// Rota para Cadastro
app.post('/signup', async (req, res) => {
    const { nome_completo, email, senha, data_nascimento, telefone, estado, cep, profissao, bairro, rua, numero } = req.body;

    try {
        // Hash da senha com o bcrypt
        const hashedPassword = await bcrypt.hash(senha, 10); // O número 10 é o "salt rounds", ajustável para aumentar a segurança

        const { data, error } = await supabase
            .from('clientes')
            .insert([
                {
                    nome_completo,
                    email,
                    senha: hashedPassword, // Salve o hash em vez da senha em texto simples
                    data_nascimento,
                    telefone,
                    estado,
                    cep,
                    profissao: profissao || null,
                    bairro,
                    rua,
                    numero
                }
            ]);

        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Cadastro realizado com sucesso!', data: { nome_completo } });        
    } catch (err) {
        res.status(500).json({ error: 'Erro ao processar o cadastro' });
    }
});

// Rota para Login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log("Dados recebidos:", { email, senha });

    // Procure o usuário pelo email
    const { data: user, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        console.log("Erro ao encontrar usuário:", error);
        return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Verifique se a senha está correta
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
        console.log("Erro: Senha incorreta");
        return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    res.status(200).json({ message: 'Login bem-sucedido!', data: { nome_completo: user.nome_completo } });
});

// Iniciar o Servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
