export function validate(schema) {
  return (req, res, next) => {
    console.log("VALIDATION BODY:", req.body);
    console.log("SCHEMA VALIDATION:", schema.safeParse(req.body));

    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log(
        "VALIDATION ERROR:",
        result.error.flatten()
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    req.body = result.data;

    next();
  };
}