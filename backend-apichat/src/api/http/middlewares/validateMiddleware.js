import { ValidationError } from "../../../shared/errors/BaseError.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const payload = req[source];
      const parsed = schema.parse(payload);

      if (source === "body") req.body = parsed;
      if (source === "query") req.query = parsed;
      if (source === "params") req.params = parsed;

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
