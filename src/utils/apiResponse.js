class ApiResponse {
    static success(message, data = null, statusCode = 200) {
        return {
            status: 'success',
            message,
            data,
            statusCode
        };
    }

    static error(message, statusCode = 500, errors = null) {
        return {
            status: 'error',
            message,
            errors,
            statusCode
        };
    }
}

module.exports = ApiResponse; 