import DOMPurify from 'isomorphic-dompurify';

export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

export function validateAndSanitize(data, schema, options = {}) {
  const { skipFields = ['password', 'token', 'refreshToken'] } = options;
  
  // Primero validar con Zod
  const validated = schema.parse(data);
  
  // Luego sanitizar strings recursivamente
  return sanitizeObject(validated, skipFields);
}

function sanitizeObject(obj, skipFields = []) {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, skipFields));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (skipFields.includes(key)) {
      sanitized[key] = value;
    } else {
      sanitized[key] = sanitizeObject(value, skipFields);
    }
  }
  
  return sanitized;
}
