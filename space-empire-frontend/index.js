// Check if user is logged in by checking localStorage for the token
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = './src/auth/login.html';
} else {
    window.location.href = './src/game/game.html';
}