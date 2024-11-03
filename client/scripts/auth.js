document.addEventListener('DOMContentLoaded', () => {
    const nomeCompleto = localStorage.getItem('nome_completo');
    const loginButton = document.getElementById('login_button');
    const logoutButton = document.getElementById('logout_button');

    if (nomeCompleto && loginButton && logoutButton) {
        // Exibe o nome do usuário e o botão "Sair"
        loginButton.textContent = nomeCompleto;
        loginButton.href = '#';
        logoutButton.style.display = 'inline';

        // Ação para o botão "Sair"
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            // Remove o nome do usuário do localStorage
            localStorage.removeItem('nome_completo');
            // Redireciona para a página principal
            window.location.href = '/';
        });
    } else if (loginButton && logoutButton) {
        // Caso não esteja logado, exibe o botão "Login" e oculta "Sair"
        loginButton.textContent = 'Login';
        loginButton.href = '/login/index.html';
        logoutButton.style.display = 'none';
    }
});
