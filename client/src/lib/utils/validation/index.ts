/**
 * Validates a student ID according to our business rules
 * @param id - Student ID to validate
 */
export function isValidStudentId(id: string): boolean {
  return /^STU-\d{8}$/.test(id);
}

/**
 * Validates a phone number according to Bangladesh format
 * @param phone - Phone number to validate
 */
export function isValidBangladeshPhone(phone: string): boolean {
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone);
}

/**
 * Validates a password according to our security requirements
 * @param password - Password to validate
 */
export function isValidPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

/**
 * Validates an email according to our business rules
 * @param email - Email to validate
 */
export function isValidEmail(email: string): boolean {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Additional business rules
  const [localPart, domain] = email.split("@");

  // Local part rules
  if (localPart.length < 3) return false;

  // Domain rules (e.g., allowing only specific domains for students)
  const allowedDomains = ["kfats.edu", "student.kfats.edu"];
  return allowedDomains.some((d) => domain.endsWith(d));
}
