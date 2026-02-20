// Email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Phone validation (Indian format)
export const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone numbers
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Postal code validation (Indian)
export const validatePostalCode = (code) => {
    const postalRegex = /^\d{6}$/;
    return postalRegex.test(code);
};

// Name validation
export const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
};

// Address validation
export const validateAddress = (address) => {
    return address.trim().length >= 5 && address.trim().length <= 255;
};

// URL validation
export const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Validate all address fields
export const validateAddressForm = (address) => {
    const errors = {};

    if (!validateName(address.firstName)) {
        errors.firstName = 'Invalid first name';
    }
    if (!validateName(address.lastName)) {
        errors.lastName = 'Invalid last name';
    }
    if (!validatePhone(address.phone)) {
        errors.phone = 'Invalid phone number';
    }
    if (!validateAddress(address.address)) {
        errors.address = 'Address must be 5-255 characters';
    }
    if (!validateName(address.city)) {
        errors.city = 'Invalid city name';
    }
    if (!validateName(address.state)) {
        errors.state = 'Invalid state name';
    }
    if (!validatePostalCode(address.postalCode)) {
        errors.postalCode = 'Invalid postal code (6 digits required)';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

// Validate login form
export const validateLoginForm = (email, password) => {
    const errors = {};

    if (!validateEmail(email)) {
        errors.email = 'Invalid email address';
    }
    if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

// Validate signup form
export const validateSignupForm = (name, email, password, confirmPassword) => {
    const errors = {};

    if (!validateName(name)) {
        errors.name = 'Name must be 2-50 characters and contain only letters';
    }
    if (!validateEmail(email)) {
        errors.email = 'Invalid email address';
    }
    if (!validatePassword(password)) {
        errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

// Validate product data
export const validateProduct = (product) => {
    const errors = {};

    if (!product.name || product.name.trim().length < 3) {
        errors.name = 'Product name must be at least 3 characters';
    }
    if (!product.description || product.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters';
    }
    if (!product.price || product.price <= 0) {
        errors.price = 'Price must be greater than 0';
    }
    if (!product.category) {
        errors.category = 'Category is required';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

export default {
    validateEmail,
    validatePassword,
    validatePhone,
    validatePostalCode,
    validateName,
    validateAddress,
    validateURL,
    sanitizeInput,
    validateAddressForm,
    validateLoginForm,
    validateSignupForm,
    validateProduct,
};
