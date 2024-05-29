document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const otpFormContainer = document.getElementById('otp-form-container');
    const responseMessage = document.getElementById('response-message');

    function isJSON(str) {
        if (typeof str !== 'string') {
            return true;
        } else {
            return false;
        }
    }

    function parseJsonWithLiteralNewlines(jsonString) {
        const placeholder = '\\n'; // This is a double backslash followed by 'n'
        const modifiedString = jsonString.replace(/\n/g, placeholder);
      
        // Step 2: Parse the modified JSON string
        const parsedObject = JSON.parse(modifiedString);
      
        // Step 3: Function to recursively replace placeholders in the parsed object
        function replacePlaceholders(obj) {
          if (typeof obj === 'string') {
            return obj.replace(new RegExp(placeholder, 'g'), '\n');
          } else if (Array.isArray(obj)) {
            return obj.map(replacePlaceholders);
          } else if (typeof obj === 'object' && obj !== null) {
            const result = {};
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                result[key] = replacePlaceholders(obj[key]);
              }
            }
            return result;
          }
          return obj; // Return the value unchanged if it's neither a string, array, nor object
        }
      
        return replacePlaceholders(parsedObject);
      }
    
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:3001/users/sign_in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: { email, password } }),
        })
        .then(response => {
            if (response.status === 200) {
                const token = response.headers.get('Authorization');
                if (token) {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('otpEnabled', false);
                    window.location.href = 'profile.html';
                    return "200"
                }
            } else if (response.status === 202) {
                return response.json()
            } else {
                return response.text()
            }
        })
        .then(data => {
            if (data === "200") return;
            if (isJSON(data)){
                responseMessage.textContent = data.status.message;
                loginForm.style.display = 'none';
                otpFormContainer.style.display = 'block';

                token = parseJsonWithLiteralNewlines(data.status.otp_token)

                const otpForm = document.getElementById('otp-form');
                otpForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const otpAttempt = document.getElementById('otp').value;
                    fetch('http://localhost:3001/users/otp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ otp_attempt: otpAttempt, otp_token: token })
                    })
                    .then(response => {
                        if (response.status === 200) {
                            const token = response.headers.get('Authorization');
                            if (token) {
                                localStorage.setItem('authToken', token);
                                localStorage.setItem('otpEnabled', true);
                                window.location.href = 'profile.html';
                            }
                        }
                        return response.text();
                    })
                    .then(text => {
                        try {
                            const data = JSON.parse(text);
                            responseMessage.textContent = data.status.message;
                        } catch (error) {
                            responseMessage.textContent = text;
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred during OTP verification.');
                    });
                });
            } else {
                responseMessage.textContent = data;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login.');
        });
    });
});
