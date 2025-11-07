// Standardized API Response Wrapper

export class ApiResponse {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      message: message || 'Success',
      data
    }
  }

  static error(message: string, errors?: any) {
    return {
      success: false,
      message,
      errors
    }
  }

  static created<T>(data: T, message: string = 'Resource created successfully') {
    return {
      success: true,
      message,
      data
    }
  }

  static updated<T>(data: T, message: string = 'Resource updated successfully') {
    return {
      success: true,
      message,
      data
    }
  }

  static deleted(message: string = 'Resource deleted successfully') {
    return {
      success: true,
      message
    }
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ) {
    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  }
}
