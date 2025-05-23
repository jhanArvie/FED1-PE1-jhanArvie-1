/**
 * Validates user name
 * @param {string} name - The name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateName(name) {
    const trimmedName = name.trim();
    return trimmedName.length >= 2;
}

/**
 Validates Noroff student email
 @param {string} email - The email to validate
  @returns {boolean} - True if valid, false otherwise
 */
export function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;
    return emailRegex.test(email.toLowerCase());
}

/**
 * Validates password
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validatePassword(password) {
    return password.length >= 8;
}

/**
 * Validates registration form data
 * @param {Object} formData - The form data to validate
 * @param {string} formData.name - User's name
 * @param {string} formData.email - User's email
 * @param {string} formData.password - User's password
 * @returns {Object} - Validation result with isValid and error message
 */
export function validateRegistrationForm(formData) {
    if (!formData.name || !formData.email || !formData.password) {
        return {
            isValid: false,
            error: 'Please fill in all required fields'
        };
    }

    if (!validateName(formData.name)) {
        return {
            isValid: false,
            error: 'Name must be at least 2 characters long'
        };
    }

    if (!validateEmail(formData.email)) {
        return {
            isValid: false,
            error: 'Please use a valid stud.noroff.no email address'
        };
    }

    if (!validatePassword(formData.password)) {
        return {
            isValid: false,
            error: 'Password must be at least 8 characters long'
        };
    }

    return {
        isValid: true,
        error: null
    };
}