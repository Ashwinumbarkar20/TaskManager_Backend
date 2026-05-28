const { sendError } = require("../utils/response");

const formatIssues = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

const validate = (schemaConfig) => (req, res, next) => {
  const hasCompositeSchema =
    schemaConfig &&
    typeof schemaConfig === "object" &&
    (schemaConfig.body || schemaConfig.query || schemaConfig.params);

  if (!hasCompositeSchema) {
    const result = schemaConfig.safeParse(req.body);

    if (!result.success) {
      return sendError(res, 400, "Validation failed", formatIssues(result.error.issues));
    }

    req.body = result.data;
    return next();
  }

  const allIssues = [];

  if (schemaConfig.body) {
    const bodyResult = schemaConfig.body.safeParse(req.body);
    if (!bodyResult.success) {
      allIssues.push(
        ...bodyResult.error.issues.map((issue) => ({
          ...issue,
          path: ["body", ...issue.path],
        }))
      );
    } else {
      req.body = bodyResult.data;
    }
  }

  if (schemaConfig.query) {
    const queryResult = schemaConfig.query.safeParse(req.query);
    if (!queryResult.success) {
      allIssues.push(
        ...queryResult.error.issues.map((issue) => ({
          ...issue,
          path: ["query", ...issue.path],
        }))
      );
    } else {
      req.query = queryResult.data;
    }
  }

  if (schemaConfig.params) {
    const paramsResult = schemaConfig.params.safeParse(req.params);
    if (!paramsResult.success) {
      allIssues.push(
        ...paramsResult.error.issues.map((issue) => ({
          ...issue,
          path: ["params", ...issue.path],
        }))
      );
    } else {
      req.params = paramsResult.data;
    }
  }

  if (allIssues.length > 0) {
    return sendError(res, 400, "Validation failed", formatIssues(allIssues));
  }
  return next();
};

module.exports = {
  validate,
};
