// Check if user is logged in by checking localStorage for the token
const token = localStorage.getItem('token');

if (!token) {
    // If not logged in, redirect to login page
    window.location.href = 'login.html';
} else {
    // Optionally, you can redirect to the game if the token exists
    window.location.href = 'game.html';
}