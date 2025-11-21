// DOM Elements
const form = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');

// Track touched fields
const touched = { name: false, email: false, message: false };

// Validation Functions
function validateName(name) {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name contains invalid characters';
  return '';
}

function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return 'Please enter a valid email address';
  return '';
}

function validateMessage(message) {
  if (!message.trim()) return 'Message is required';
  if (message.trim().length < 10) return 'Message must be at least 10 characters';
  return '';
}

// Show/Hide Error
function showError(input, errorElement, message) {
  input.classList.add('error');
  errorElement.textContent = message;
  errorElement.classList.add('show');
}

function hideError(input, errorElement) {
  input.classList.remove('error');
  errorElement.textContent = '';
  errorElement.classList.remove('show');
}

// Validate Individual Field
function validateField(fieldName) {
  let error = '';
  
  switch (fieldName) {
    case 'name':
      error = validateName(nameInput.value);
      if (error && touched.name) {
        showError(nameInput, nameError, error);
      } else {
        hideError(nameInput, nameError);
      }
      break;
    case 'email':
      error = validateEmail(emailInput.value);
      if (error && touched.email) {
        showError(emailInput, emailError, error);
      } else {
        hideError(emailInput, emailError);
      }
      break;
    case 'message':
      error = validateMessage(messageInput.value);
      if (error && touched.message) {
        showError(messageInput, messageError, error);
      } else {
        hideError(messageInput, messageError);
      }
      break;
  }
  
  return error === '';
}

// Validate Entire Form
function validateForm() {
  touched.name = true;
  touched.email = true;
  touched.message = true;
  
  const nameValid = validateField('name');
  const emailValid = validateField('email');
  const messageValid = validateField('message');
  
  return nameValid && emailValid && messageValid;
}

// Event Listeners for Real-time Validation
nameInput.addEventListener('blur', () => {
  touched.name = true;
  validateField('name');
});

emailInput.addEventListener('blur', () => {
  touched.email = true;
  validateField('email');
});

messageInput.addEventListener('blur', () => {
  touched.message = true;
  validateField('message');
});

// Validate on input if field has been touched
nameInput.addEventListener('input', () => {
  if (touched.name) validateField('name');
});

emailInput.addEventListener('input', () => {
  if (touched.email) validateField('email');
});

messageInput.addEventListener('input', () => {
  if (touched.message) validateField('message');
});

// Set Loading State
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  
  if (isLoading) {
    submitBtn.innerHTML = `
      <div class="spinner"></div>
      <span>Sending...</span>
    `;
  } else {
    submitBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
      <span>Send Message</span>
    `;
  }
}

// Show Success Message
function showSuccess() {
  successMessage.classList.add('show');
  
  setTimeout(() => {
    successMessage.classList.remove('show');
  }, 5000);
}

// Reset Form
function resetForm() {
  form.reset();
  touched.name = false;
  touched.email = false;
  touched.message = false;
  hideError(nameInput, nameError);
  hideError(emailInput, emailError);
  hideError(messageInput, messageError);
}

// Form Submit Handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Hide any existing success message
  successMessage.classList.remove('show');
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Set loading state
  setLoading(true);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Reset loading state
  setLoading(false);
  
  // Show success and reset form
  showSuccess();
  resetForm();
});