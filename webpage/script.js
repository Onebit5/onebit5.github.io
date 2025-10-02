// Security: Input sanitization and validation
const SecurityUtils = {
    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Validate username format (alphanumeric and underscore only)
    isValidUsername(username) {
        return /^[a-zA-Z0-9_]{3,20}$/.test(username);
    },

    // Check password strength requirements
    isStrongPassword(password) {
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password) &&
               /[^A-Za-z0-9]/.test(password);
    }
};

// Password strength checker with detailed requirements
function checkPasswordStrength(password) {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    // Count how many criteria are met
    let strength = 0;
    if (hasMinLength) strength++;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    // Determine strength level
    if (strength <= 2) {
        return 0; // Weak
    } else if (strength === 3 || strength === 4) {
        return 1; // Medium - has some requirements but not all
    } else if (hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
        return 2; // Strong - has ALL requirements
    }

    return 1; // Default to medium
}

function updatePasswordStrength(password) {
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    const strength = checkPasswordStrength(password);

    strengthFill.className = 'strength-fill';
    if (strength === 0) {
        strengthFill.classList.add('strength-weak');
        strengthText.textContent = 'Weak password';
    } else if (strength === 1) {
        strengthFill.classList.add('strength-medium');
        strengthText.textContent = 'Medium password - needs all requirements';
    } else if (strength === 2) {
        strengthFill.classList.add('strength-strong');
        strengthText.textContent = 'Strong password';
    } else {
        strengthText.textContent = 'Password strength';
    }
}

function showNotification(message, type) {
    console.log('showNotification called:', message, type); // Debug log

    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => {
        notif.remove();
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.transition = 'transform 0.3s ease';
    notification.style.transform = 'translateX(400px)';

    if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    }

    document.body.appendChild(notification);

    // Force reflow
    notification.offsetHeight;

    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function validateInput(input) {
    const inputGroup = input.parentElement;
    const errorMessage = inputGroup.querySelector('.error-message');
    const icon = inputGroup.querySelector('.input-icon');
    let isValid = true;
    let message = '';

    // Remove previous states
    input.classList.remove('error', 'success');
    icon.classList.remove('show');
    errorMessage.classList.remove('show');

    if (input.name === 'username') {
        if (input.value.length < 3) {
            isValid = false;
            message = 'Username must be at least 3 characters long';
        } else if (input.value.length > 20) {
            isValid = false;
            message = 'Username must be less than 20 characters';
        } else if (!SecurityUtils.isValidUsername(input.value)) {
            isValid = false;
            message = 'Username can only contain letters, numbers, and underscores';
        }
    } else if (input.name === 'password') {
        if (input.value.length < 8) {
            isValid = false;
            message = 'Password must be at least 8 characters long';
        } else if (!SecurityUtils.isStrongPassword(input.value)) {
            isValid = false;
            message = 'Password must contain uppercase, lowercase, numbers, and special characters';
        }
        updatePasswordStrength(input.value);
    } else if (input.name === 'confirmPassword') {
        const password = form.querySelector('[name="password"]').value;
        if (input.value !== password) {
            isValid = false;
            message = 'Passwords do not match';
        }
    }

    if (!isValid && input.value) {
        input.classList.add('error');
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    } else if (input.value) {
        input.classList.add('success');
        icon.classList.add('show');
    }

    return isValid;
}

// Initialize form - wrapped to ensure DOM is loaded
let form, inputs;

function initializeForm() {
    form = document.getElementById('registerForm');
    inputs = form.querySelectorAll('.form-input');

    // Add event listeners for real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error') || input.classList.contains('success')) {
                validateInput(input);
            }
        });
    });

    // Form submission with enhanced security
    form.addEventListener('submit', handleFormSubmit);
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all inputs
    let isFormValid = true;
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isFormValid = false;
        }
    });

    // Validate terms checkbox
    const termsCheckbox = form.querySelector('#terms');
    if (!termsCheckbox.checked) {
        isFormValid = false;
        showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
    }

    if (!isFormValid) {
        //showNotification('Please fix the errors above', 'error');
        return;
    }

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
        // Sanitize inputs before sending
        const data = {
            username: SecurityUtils.sanitizeInput(form.username.value.trim()),
            password: form.password.value, // Don't sanitize password (needs exact match)
            confirmPassword: form.confirmPassword.value
        };

        // Additional client-side validation
        if (data.username.length < 3 || data.username.length > 20) {
            throw new Error('Invalid username length');
        }

        if (data.password !== data.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const res = await fetch('https://83.231.69.9:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await res.text();

        if (res.ok) {
            showNotification('Account created successfully!', 'success');

            // Reset form
            form.reset();
            inputs.forEach(input => {
                input.classList.remove('success', 'error');
                input.parentElement.querySelector('.input-icon').classList.remove('show');
            });
            document.querySelector('.strength-fill').className = 'strength-fill';
            document.querySelector('.strength-text').textContent = 'Password strength';
        } else {
            showNotification(result || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
        console.error('Registration error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Prevent common security issues and initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the form
    initializeForm();

    // Prevent form submission on Enter in input fields (except submit button)
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextInput = input.parentElement.nextElementSibling?.querySelector('.form-input');
                if (nextInput) {
                    nextInput.focus();
                } else {
                    form.querySelector('.submit-btn').click();
                }
            }
        });
    });
});
