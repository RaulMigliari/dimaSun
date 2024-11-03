// Função para enviar dados do formulário de cadastro
document.getElementById('form_cadastro')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('nome_completo', result.data.nome_completo);
        window.location.href = '/index.html';
    } else {
        alert(result.message || 'Erro no cadastro');
    }
});

// Função para enviar dados do formulário de login
document.getElementById('form_login')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('nome_completo', result.data.nome_completo);
        window.location.href = '/index.html';
    } else {
        alert(result.message || 'Erro no login');
    }
});
