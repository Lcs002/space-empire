const form = document.getElementById('registerForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            alert('Registration successful. You can now log in.');
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            const { message } = await response.json();
            alert(message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
