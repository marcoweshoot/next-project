// Validation utilities for secure input handling

export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitizedValue?: any
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }

  // Basic email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  // Length check
  if (email.length > 254) {
    return { isValid: false, error: 'Email too long' }
  }

  return { 
    isValid: true, 
    sanitizedValue: email.toLowerCase().trim() 
  }
}

// Italian Fiscal Code validation
export function validateFiscalCode(fiscalCode: string): ValidationResult {
  if (!fiscalCode || typeof fiscalCode !== 'string') {
    return { isValid: false, error: 'Fiscal code is required' }
  }

  // Remove spaces and convert to uppercase
  const cleanCode = fiscalCode.replace(/\s/g, '').toUpperCase()

  // Italian fiscal code regex: 6 letters + 2 digits + 1 letter + 2 digits + 1 letter + 3 digits + 1 letter
  const fiscalCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
  
  if (!fiscalCodeRegex.test(cleanCode)) {
    return { isValid: false, error: 'Invalid Italian fiscal code format' }
  }

  return { 
    isValid: true, 
    sanitizedValue: cleanCode 
  }
}

// Phone number validation (Italian format)
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' }
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')

  // Italian phone number: 10-11 digits, starting with 3
  const phoneRegex = /^3[0-9]{9,10}$/
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Invalid Italian phone number format' }
  }

  return { 
    isValid: true, 
    sanitizedValue: cleanPhone 
  }
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password too long' }
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^admin/i
  ]

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return { isValid: false, error: 'Password is too weak' }
    }
  }

  return { isValid: true, sanitizedValue: password }
}

// Name validation
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: `${fieldName} is required` }
  }

  const cleanName = name.trim()

  if (cleanName.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` }
  }

  if (cleanName.length > 50) {
    return { isValid: false, error: `${fieldName} too long` }
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/
  
  if (!nameRegex.test(cleanName)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` }
  }

  return { 
    isValid: true, 
    sanitizedValue: cleanName 
  }
}

// Price validation
export function validatePrice(price: number | string): ValidationResult {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Invalid price format' }
  }

  if (numPrice < 0) {
    return { isValid: false, error: 'Price cannot be negative' }
  }

  if (numPrice > 100000) {
    return { isValid: false, error: 'Price too high' }
  }

  // Round to 2 decimal places
  const roundedPrice = Math.round(numPrice * 100) / 100

  return { 
    isValid: true, 
    sanitizedValue: roundedPrice 
  }
}

// Quantity validation
export function validateQuantity(quantity: number | string): ValidationResult {
  const numQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity

  if (isNaN(numQuantity)) {
    return { isValid: false, error: 'Invalid quantity format' }
  }

  if (!Number.isInteger(numQuantity)) {
    return { isValid: false, error: 'Quantity must be a whole number' }
  }

  if (numQuantity < 1) {
    return { isValid: false, error: 'Quantity must be at least 1' }
  }

  if (numQuantity > 10) {
    return { isValid: false, error: 'Quantity cannot exceed 10' }
  }

  return { 
    isValid: true, 
    sanitizedValue: numQuantity 
  }
}

// VAT Number validation (Italian format)
export function validateVATNumber(vatNumber: string): ValidationResult {
  if (!vatNumber || typeof vatNumber !== 'string') {
    return { isValid: false, error: 'VAT number is required' }
  }

  // Remove spaces and convert to uppercase
  const cleanVAT = vatNumber.replace(/\s/g, '').toUpperCase()

  // Italian VAT number: IT + 11 digits
  const vatRegex = /^IT[0-9]{11}$/
  
  if (!vatRegex.test(cleanVAT)) {
    return { isValid: false, error: 'Invalid Italian VAT number format' }
  }

  return { 
    isValid: true, 
    sanitizedValue: cleanVAT 
  }
}

// Generic string sanitization
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
}

// Validate and sanitize multiple fields
export function validateFields(fields: Record<string, any>): {
  isValid: boolean
  errors: Record<string, string>
  sanitizedData: Record<string, any>
} {
  const errors: Record<string, string> = {}
  const sanitizedData: Record<string, any> = {}

  for (const [key, value] of Object.entries(fields)) {
    let result: ValidationResult

    switch (key.toLowerCase()) {
      case 'email': {
        result = validateEmail(value)
        break
      }
      case 'fiscal_code': {
        result = validateFiscalCode(value)
        break
      }
      case 'phone_number':
      case 'phone': {
        result = validatePhoneNumber(value)
        break
      }
      case 'password': {
        result = validatePassword(value)
        break
      }
      case 'first_name':
      case 'firstname': {
        result = validateName(value, 'First name')
        break
      }
      case 'last_name':
      case 'lastname': {
        result = validateName(value, 'Last name')
        break
      }
      case 'price':
      case 'amount': {
        result = validatePrice(value)
        break
      }
      case 'quantity': {
        result = validateQuantity(value)
        break
      }
      case 'vat_number': {
        result = validateVATNumber(value)
        break
      }
      case 'privacyaccepted':
      case 'privacy_accepted':
      case 'marketingaccepted':
      case 'marketing_accepted':
      case 'confirmpassword':
      case 'confirm_password': {
        // Boolean or confirmation fields - just pass through
        result = { 
          isValid: true, 
          sanitizedValue: value 
        }
        break
      }
      default: {
        // Generic string validation
        if (typeof value === 'boolean') {
          // Handle boolean values
          result = { 
            isValid: true, 
            sanitizedValue: value 
          }
        } else {
          const sanitized = sanitizeString(value)
          result = { 
            isValid: sanitized.length > 0, 
            sanitizedValue: sanitized 
          }
        }
        break
      }
    }

    if (!result.isValid) {
      errors[key] = result.error || 'Invalid value'
    } else {
      sanitizedData[key] = result.sanitizedValue
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  }
}
