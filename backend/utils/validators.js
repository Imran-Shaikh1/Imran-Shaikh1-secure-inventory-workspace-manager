const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const requireFields = (body, fields) => {
  const missing = fields.filter((field) => !isNonEmptyString(body[field]));
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

module.exports = { isNonEmptyString, isEmail, requireFields };
