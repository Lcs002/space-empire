const form = document.getElementById('loginForm');
        
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const { token } = await response.json();
            // Store the token in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            // Redirect to game page
            window.location.href = '/game.html';
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});