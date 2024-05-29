document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const responseMessage = document.getElementById('response-message');

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:3001/users', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: { email, password } }),
        })
        .then(response => response.json().then(data => ({status: response.status, body: data})))
        .then(({body}) => {
            responseMessage.textContent = body.status.message;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during sign up.');
        });
    });
});
