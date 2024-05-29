document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    const enable2FAButton = document.getElementById('enable-2fa-button');
    const disable2FAButton = document.getElementById('disable-2fa-button');
    const responseMessage = document.getElementById('response-message');
    const qrCodeContainer = document.getElementById('qrcode-container');
    const otpFormContainer = document.getElementById('otp-form-container');
    let authToken = localStorage.getItem('authToken');

    function showItems(){
        let otpEnabled = localStorage.getItem('otpEnabled');
        if(otpEnabled === "true") {
            enable2FAButton.style.display = 'none';
            disable2FAButton.style.display = 'block';
        } else {
            disable2FAButton.style.display = 'none';
            enable2FAButton.style.display = 'block';
        }
    }

    showItems();

    logoutButton.addEventListener('click', () => {
        fetch('http://localhost:3001/users/sign_out', {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        })
        .then(response => {
            if (response.status === 200) {
            localStorage.removeItem('authToken'); 
            localStorage.removeItem('otpEnabled');
            authToken = null; 
            window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during logout.');
        });
    });

    enable2FAButton.addEventListener('click', () => {
        fetch('http://localhost:3001/users/enable_otp_show_qr', {
            method: 'GET',
            headers: {
            'Authorization': authToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.status.code === 200){
                new QRCode(qrCodeContainer, data.status.data.uri);

                otpFormContainer.style.display = 'block';
                const otpForm = document.getElementById('otp-form');

                otpForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const otpAttempt = document.getElementById('otp').value;
                    fetch('http://localhost:3001/users/enable_otp_verify', {
                        method: 'POST',
                        headers: {
                            'Authorization': authToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ otp_attempt: otpAttempt })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status.code === 200) {
                            qrCodeContainer.innerHTML = ''; // Remove QR code
                            otpFormContainer.style.display = 'none'; // Remove OTP form
                            localStorage.setItem('otpEnabled', true);
                            showItems();
                        }
                        responseMessage.textContent = data.status.message;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred during OTP verification.');
                    });
                });
            } else {
                responseMessage.textContent = data.status.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during 2FA setup.');
        });
    });

    disable2FAButton.addEventListener('click', () => {
        otpFormContainer.style.display = 'block';
        const otpForm = document.getElementById('otp-form');

        otpForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const otpAttempt = document.getElementById('otp').value;
            fetch('http://localhost:3001/users/disable_otp_verify', {
                method: 'POST',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp_attempt: otpAttempt })
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log(data)
                if (data.status === 200) {
                    otpFormContainer.style.display = 'none';
                    localStorage.setItem('otpEnabled', false);
                    showItems();
                }
                responseMessage.textContent = data.message;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during OTP verification.');
            });
        });
    });
});