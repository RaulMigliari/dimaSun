document.addEventListener('DOMContentLoaded', () => {
    // Dados de exemplo para teste
    const dadosExemplo = {
        recomendacoes: [
            {
                posicao: 1,
                empresa: {
                    nome: "Solar Tech Vitória",
                    localizacao: "Vitória-ES",
                    tempoInstalacao: "2 meses",
                    diferenciais: ["Melhor custo-benefício", "Garantia estendida"]
                },
                orcamento: {
                    valorTotal: 25000
                },
                motivoEscolha: "Melhor relação custo-benefício e prazo de instalação compatível"
            },
            {
                posicao: 2,
                empresa: {
                    nome: "EcoSol Energia",
                    localizacao: "Serra-ES",
                    tempoInstalacao: "3 meses",
                    diferenciais: ["Equipamentos premium", "Suporte 24h"]
                },
                orcamento: {
                    valorTotal: 28000
                },
                motivoEscolha: "Qualidade superior dos equipamentos e excelente suporte"
            },
            {
                posicao: 3,
                empresa: {
                    nome: "Green Power",
                    localizacao: "Vila Velha-ES",
                    tempoInstalacao: "2.5 meses",
                    diferenciais: ["Financiamento facilitado", "Instalação rápida"]
                },
                orcamento: {
                    valorTotal: 26500
                },
                motivoEscolha: "Boas condições de financiamento e prazo adequado"
            }
        ],
        observacoes: "Mediante análise dos pontos do seu perfil, recomendamos que siga com outras fontes de energia. Entretanto, se decidir continuar sua busca, aconselhamos que procure umas das três empresas acima."
    };

    exibirRecomendacoes(dadosExemplo);
});

function exibirRecomendacoes(dados) {
    const cards = document.querySelectorAll('.card');
    
    dados.recomendacoes.forEach((rec, index) => {
        const card = cards[index];
        if (!card) return;

        const empresaInfo = card.querySelector('.empresa-info');
        const orcamentoInfo = card.querySelector('.orcamento-info');

        empresaInfo.innerHTML = `
            <div class="empresa-detalhes">
                <h3>${rec.empresa.nome}</h3>
                <p class="localizacao"><i class="fas fa-map-marker-alt"></i> ${rec.empresa.localizacao}</p>
                <p class="tempo"><i class="fas fa-clock"></i> Tempo de instalação: ${rec.empresa.tempoInstalacao}</p>
                <div class="diferenciais">
                    <h4>Diferenciais:</h4>
                    <ul>
                        ${rec.empresa.diferenciais.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        orcamentoInfo.innerHTML = `
            <div class="orcamento-detalhes">
                <h4>Orçamento</h4>
                <p class="valor-total">R$ ${rec.orcamento.valorTotal.toLocaleString('pt-BR')}</p>
                <p class="motivo">${rec.motivoEscolha}</p>
            </div>
        `;
    });

    // Adicionar observações gerais
    const container = document.querySelector('.resultados-container');
    if (!container.querySelector('.observacoes')) {
        const obsElement = document.createElement('div');
        obsElement.className = 'observacoes';
        obsElement.innerHTML = `<p>${dados.observacoes}</p>`;
        container.appendChild(obsElement);
    }
}