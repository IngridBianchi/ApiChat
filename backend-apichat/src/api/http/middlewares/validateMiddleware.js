import { ValidationError } from "../../../shared/errors/BaseError.js";
import { validateAndSanitize } from "../../../shared/utils/sanitizer.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const payload = req[source];
      
      // Validar y sanitizar (excepto si es body y tiene campos sensibles como password)
      let result;
      
      // Una forma sencilla es sanitizar todo y luego restaurar passwords, 
      // o mejor, solo sanitizar campos específicos si es necesario.
      // Pero validateAndSanitize sanitiza todos los strings.
      // Para simplificar, si es el body de registro/login, podríamos querer saltar sanitización en el password.
      
      // Decidimos sanitizar siempre, ya que validateAndSanitize escapa HTML, 
      // lo cual es bueno incluso para passwords si se van a mostrar (que no es el caso).
      // Sin embargo, DOMPurify podría alterar caracteres válidos en passwords.
      
      const parsed = schema.parse(payload);
      
      // Sanitización recursiva
      const sanitized = validateAndSanitize(payload, schema);

      if (source === "body") req.body = sanitized;
      if (source === "query") req.query = sanitized;
      if (source === "params") req.params = sanitized;

      next();
    } catch (err) {
      const details = (err.issues || []).map((issue) => ({
        field: issue.path?.join(".") || source,
        issue: issue.message,
      }));
      next(new ValidationError(details));
    }
  };
}
