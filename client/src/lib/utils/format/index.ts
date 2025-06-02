/**
 * Formats a student ID according to our display rules
 * @param id - Raw student ID
 */
export function formatStudentId(id: string): string {
  // Assuming format: STU-XXXXXXXX
  if (!id.startsWith("STU-")) return id;
  const number = id.slice(4);
  return `STU-${number.slice(0, 4)}-${number.slice(4)}`;
}

/**
 * Formats a Bangladesh phone number for display
 * @param phone - Raw phone number
 */
export function formatBangladeshPhone(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle different formats
  if (digits.length === 11) {
    // Format: 017XX-XXXXXX
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  } else if (digits.length === 13 && digits.startsWith("880")) {
    // Format: +880 17XX-XXXXXX
    return `+880 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

/**
 * Formats an academic year according to our standards
 * @param year - Academic year number
 */
export function formatAcademicYear(year: number): string {
  return `${year}-${year + 1}`;
}

/**
 * Formats a grade according to our grading system
 * @param score - Numeric score
 */
export function formatGrade(score: number): string {
  if (score >= 80) return "A+";
  if (score >= 75) return "A";
  if (score >= 70) return "A-";
  if (score >= 65) return "B+";
  if (score >= 60) return "B";
  if (score >= 55) return "B-";
  if (score >= 50) return "C+";
  if (score >= 45) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * Formats currency in BDT
 * @param amount - Amount in BDT
 */
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(amount);
}
