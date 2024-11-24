import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Use URL para lidar com o caminho no formato ESM
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = process.env.PORT || 3000;

// Configuração do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuração do OpenAI
const configuration = {
    apiKey: process.env.OPENAI_API_KEY,
    organization: "org-RChuKsXqfYXO70oR7G18Iu6y",
    project: "proj_P9RPsOpGavFAhqZAbrqmsm2B",
}
const openai = new OpenAI(configuration);

app.use(bodyParser.json());

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

app.post('/empresa', async (req, res) => {
    const {
        nomeEmpresa,
        cnpj,
        telefone,
        endereco,
        emailContato,
        site,
        placas,
        maoDeObra,
        valorMaoDeObra,
        equipamentoAdicional,
        inversores,
        taxa,
        frete,
        servicos,
        garantiaSuporte,
        opcaoFinanciamento,
        estimativa,
    } = req.body;

    try {
        const { data, error } = await supabase
            .from('empresas')
            .insert([{
                nome_empresa: nomeEmpresa,
                cnpj,
                telefone,
                endereco,
                email_contato: emailContato,
                site,
                valor_placas: placas,
                necessidade_mao_de_obra: maoDeObra,
                valor_equipe: valorMaoDeObra,
                equipamentos_adicionais: equipamentoAdicional,
                inversores,
                impostos_taxas: taxa,
                frete,
                servicos,
                garantia_suporte: garantiaSuporte,
                opcao_financiamento: opcaoFinanciamento,
                estimativa,
            }]);

        if (error) {
            console.error('Erro ao inserir dados:', error);
            res.status(500).json({ error: 'Erro ao salvar os dados no banco de dados.' });
        } else {
            res.status(201).json({ message: 'Empresa cadastrada com sucesso!', data });
        }
    } catch (err) {
        console.error('Erro no servidor:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

app.post('/encontrar-empresas', async (req, res) => {
    try {
        const dadosCliente = req.body;

        // Recuperar empresas do banco de dados
        const { data: empresas, error } = await supabase.from('empresas').select('*');

        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar empresas' });
        }

        // Criar um prompt baseado nas informações do cliente e das empresas
        const prompt = `
        Baseando-se nas informações do cliente:
        Nome: ${dadosCliente.nome}
        Localização: ${dadosCliente.endereco}
        Consumo médio: ${dadosCliente.consumo} kWh
        Serviço requisitado: ${dadosCliente.servicos}

        E na lista de empresas disponíveis:
        ${empresas.map((empresa, index) => `
        Empresa ${index + 1}:
        Nome: ${empresa.nomeEmpresa}
        Cidade-Estado: ${empresa.endereco}
        Serviços: ${empresa.servicos}
        Custos: 
            - Placas solares por m²: R$${empresa.placas}
            - Frete: R$${empresa.frete} a cada 70km
            - Taxas: R$${empresa.taxa}
        `).join('\n')}

        Determine as 3 empresas mais indicadas para atender às necessidades do cliente com base na qualidade, custo-benefício e viabilidade.
        `;

        // Chamar a API do OpenAI para gerar as recomendações
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const recomendacoes = response.data.choices[0].text.trim();

        res.status(200).json({ recomendacoes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});

// Iniciar o Servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
