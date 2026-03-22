/**
 * Standardized API response envelope.
 * Every successful response follows: { success, data, meta? }
 * Every error response follows:      { success, error: { code, message, details? } }
 */

export const success = (res, data = null, statusCode = 200, meta = null) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const created = (res, data = null) => success(res, data, 201);

export const noContent = (res) => res.status(204).send();

export const paginated = (res, { docs, total, page, limit }) => {
  const totalPages = Math.ceil(total / limit);
  return success(res, docs, 200, {
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};
