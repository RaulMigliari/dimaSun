document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Coletar todos os dados do formulário
    const formData = {
        nome: document.getElementById('nome').value,
        endereco: document.getElementById('endereco').value,
        tamanho: document.getElementById('tamanho').value,
        consumo: document.getElementById('consumo').value,
        tipo_imovel: document.getElementById('tipo-imovel').value,
        prazo_instalacao: document.getElementById('prazo-instalacao').value,
        preferencia: document.getElementById('preferencia').value,
        orcamento: document.getElementById('orcamento').value,
        email: document.getElementById('email').value
    };

    try {
        const response = await fetch('http://localhost:3000/encontrar-empresas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            // Armazenar os dados no localStorage para recuperar na página de resultados
            localStorage.setItem('recomendacoes', JSON.stringify(result.recomendacoes));
            // Redirecionar para a página de resultados
            window.location.href = '/resultados/index.html';
        } else {
            alert(result.error || 'Erro ao gerar recomendações.');
        }
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        alert('Erro ao processar solicitação.');
    }
});