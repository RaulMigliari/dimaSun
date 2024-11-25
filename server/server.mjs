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
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
        console.log('Dados do cliente recebidos:', dadosCliente);

        // Recuperar empresas do banco de dados
        const { data: empresas, error } = await supabase.from('empresas').select('*');

        if (error) {
            console.error('Erro ao buscar empresas:', error);
            return res.status(500).json({ error: 'Erro ao buscar empresas' });
        }

        if (!empresas || empresas.length === 0) {
            console.log('Nenhuma empresa encontrada no banco de dados');
            return res.status(404).json({ error: 'Nenhuma empresa encontrada' });
        }

        console.log(`Encontradas ${empresas.length} empresas`);

        // Criar um prompt baseado nas informações do cliente e das empresas
        
const prompt = `
Analise as informações do cliente e das empresas disponíveis e retorne um JSON estruturado com as 3 melhores recomendações.

Informações do Cliente:
- Nome: ${dadosCliente.nome}
- Tamanho da instalação: ${dadosCliente.tamanho}m²
- Consumo médio: ${dadosCliente.consumo}kWh
- Preferência: ${dadosCliente.preferencia}
- Prazo desejado: ${dadosCliente.prazo_instalacao}

Empresas Disponíveis:
${empresas.map((empresa, index) => `
Empresa ${index + 1}:
- Nome: ${empresa.nome_empresa}
- Localização: ${empresa.endereco}
- Custos Base:
  * Placas solares/m²: R$${empresa.valor_placas}
  * Equipe: R$${empresa.valor_equipe}
  * Inversores: R$${empresa.inversores}
  * Equipamentos: R$${empresa.equipamentos_adicionais}
  * Taxas: R$${empresa.impostos_taxas}
- Tempo estimado: ${empresa.estimativa} meses
`).join('\n')}

Calcule o orçamento usando: (área * valor_placas) + equipe + equipamentos + taxas + inversores.
Priorize as 3 melhoes empresas que atendam às preferências do cliente (custo-benefício, qualidade ou viabilidade).

Por favor, forneça a resposta no seguinte formato JSON:
{
  "recomendacoes": [
    {
      "posicao": 1,
      "empresa": {
        "nome": "Nome da Empresa",
        "localizacao": "Cidade-Estado",
        "tempoInstalacao": "X meses",
        "diferenciais": ["diferencial 1", "diferencial 2"]
      },
      "orcamento": {
        "valorTotal": 00000,
      },
      "motivoEscolha": "Breve explicação do motivo desta recomendação"
    }
  ],
  "observacoes": "Observações gerais sobre as recomendações"
}
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

        console.log('Resposta da OpenAI:', response);

        const recomendacoes = response.choices[0].message.content;
        
        console.log('Recomendações geradas:', recomendacoes);

        res.status(200).json({ recomendacoes });
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ 
            error: 'Erro ao processar a solicitação',
            detalhes: error.message 
        });
    }
});

// Iniciar o Servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
