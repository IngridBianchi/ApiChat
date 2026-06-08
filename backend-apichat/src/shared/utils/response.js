export class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      status: 'success',
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message, code = 'INTERNAL_ERROR', details = null, statusCode = 500) {
    return {
      status: 'error',
      statusCode,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(items, pagination, message = 'Success') {
    return {
      status: 'success',
      message,
      data: items,
      pagination: {
        limit: pagination.limit,
        hasMore: pagination.hasMore,
        nextCursor: pagination.nextCursor,
        count: items.length,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export function responseMiddleware(req, res, next) {
  res.success = (data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json(ApiResponse.success(data, message, statusCode));
  };

  res.error = (message, code = 'INTERNAL_ERROR', details = null, statusCode = 500) => {
    res.status(statusCode).json(ApiResponse.error(message, code, details, statusCode));
  };

  res.paginated = (items, pagination, message = 'Success') => {
    res.json(ApiResponse.paginated(items, pagination, message));
  };

  next();
}
