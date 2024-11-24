document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const dadosCliente = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('http://localhost:3000/encontrar-empresas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCliente),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Recomendações: \n' + result.recomendacoes);
        } else {
            alert(result.error || 'Erro ao gerar recomendações.');
        }
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        alert('Erro ao processar solicitação.');
    }
});
