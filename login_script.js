document.addEventListener('DOMContentLoaded', () => {
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const googleLoginBtn = document.getElementById('google-login-btn');

    // --- Simulated User Storage (In a real app, this would be a database) ---
    // Added a default admin user for demonstration purposes
    const users = [
        { name: 'Admin', surname: 'User', idNumber: '1234567890123', email: 'admin@clinic.com', password: 'adminpassword' }
    ];
    // This will simulate audit logs for login/logout actions on this page
    let auditLogs = []; // Stores audit logs for this session

    // --- Function to add audit log entries ---
    function logAudit(userEmail, actionType) {
        const timestamp = new Date().toLocaleString('en-ZA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Use 24-hour format
        });
        auditLogs.push({
            user: userEmail,
            action: actionType,
            timestamp: timestamp
        });
        // In a real app, you'd send this to your backend for persistent storage
        console.log(`Audit Log: ${userEmail} - ${actionType} at ${timestamp}`);
    }

    // --- Function to switch forms ---
    function showForm(formToShow) {
        if (formToShow === 'login') {
            registerBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
        } else { // 'register'
            loginBox.classList.add('hidden');
            registerBox.classList.remove('hidden');
        }
    }

    // --- Event Listeners for Form Switching ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('register');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('login');
    });

    // --- Login Functionality (Simulated) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simulate user authentication
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            alert('Login successful! Welcome, ' + user.name + '!');
            logAudit(email, 'Logged In'); // Log the successful login
            // In a real application, you would redirect to the dashboard here:
            window.location.href = 'index.html'; // Assuming index.html is your admin dashboard
        } else {
            alert('Login failed. Invalid email or password.');
            logAudit(email, 'Login Failed'); // Log failed login attempts
        }
        loginForm.reset();
    });

    // --- Google Login Functionality (Simulated) ---
    googleLoginBtn.addEventListener('click', () => {
        alert('Redirecting to Google for login... (This requires backend integration for OAuth)');
        logAudit('Google User (attempt)', 'Google Login Attempt'); // Log Google login attempt
        // In a real application, you would initiate the Google OAuth flow here
        // window.location.href = 'https://accounts.google.com/o/oauth2/auth?...';
    });

    // --- Register Functionality (Simulated) ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const surname = document.getElementById('register-surname').value.trim();
        const idNumber = document.getElementById('register-id-number').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Basic Front-end Validation
        if (!name || !surname || !idNumber || !email || !password || !confirmPassword) {
            alert('All fields are required.');
            return;
        }

        if (idNumber.length !== 13 || !/^\d{13}$/.test(idNumber)) {
            alert('ID Number must be exactly 13 digits.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Password and Confirm Password do not match.');
            return;
        }

        // Check if email already exists (simulated)
        if (users.some(u => u.email === email)) {
            alert('This email is already registered.');
            return;
        }

        // Simulate user registration
        const newUser = {
            name: name,
            surname: surname,
            idNumber: idNumber,
            email: email,
            password: password // In a real app, hash this password!
        };
        users.push(newUser);

        alert('Registration successful! You can now log in.');
        logAudit(email, 'Registered New Account'); // Log the registration
        registerForm.reset();
        showForm('login'); // Take user back to login page
    });

    // --- Simulate Logout (Add this to your admin dashboard script, e.g., in index.html) ---
    // This is an example of how you'd trigger a logout log.
    // You would typically have a logout button on your dashboard that calls a function like this.
    window.simulateLogout = function(userEmail) {
        logAudit(userEmail, 'Logged Out');
        alert('You have been logged out.');
        // In a real app, clear session/token and redirect to login page
        // window.location.href = 'login.html';
    };

    // To demonstrate, you can call simulateLogout('admin@clinic.com') from your browser console
    // after logging in to see the audit log entry.
});