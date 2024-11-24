document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previne o envio padrão do formulário

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()); // Converte os dados do formulário em um objeto

        try {
            const response = await fetch('http://localhost:3000/empresa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Empresa cadastrada com sucesso!');
                form.reset(); // Limpa o formulário após o sucesso
                window.location.href = '../index.html';
            } else {
                alert(result.error || 'Erro ao cadastrar empresa.');
            }
        } catch (err) {
            console.error('Erro:', err);
            alert('Erro ao conectar ao servidor.');
        }
    });
});
