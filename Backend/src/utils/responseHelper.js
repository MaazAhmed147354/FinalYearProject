/**
 * responseHelper.js
 * This module provides helper functions for generating standardized API responses.
 */

/**
 * Generates a success response.
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} data - The data to return in the response
 * @param {string} message - A message to include in the response (optional)
 * @returns {object} - The structured response object
 */
const successResponse = (statusCode = 200, data = {}, message = '') => {
    return {
        statusCode,
        body: JSON.stringify({
            success: true,
            message: message || 'Operation successful',
            data,
        }),
    };
};

/**
 * Generates an error response.
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - A message to include in the response
 * @param {object} errorDetails - Additional error details (optional)
 * @returns {object} - The structured error response object
 */
const errorResponse = (statusCode = 500, message = 'Internal Server Error', errorDetails = {}) => {
    return {
        statusCode,
        body: JSON.stringify({
            success: false,
            message,
            error: errorDetails,  // Include error details if provided
        }),
    };
};

/**
 * Generates a validation error response.
 * @param {object} validationErrors - An object containing validation error messages
 * @returns {object} - The structured validation error response object
 */
const validationErrorResponse = (validationErrors = {}) => {
    return {
        statusCode: 400,
        body: JSON.stringify({
            success: false,
            message: 'Validation errors occurred',
            errors: validationErrors,  // Include validation errors
        }),
    };
};

/**
 * Generates a 404 Not Found response.
 * @returns {object} - The structured 404 error response object
 */
const notFoundResponse = () => {
    return {
        statusCode: 404,
        body: JSON.stringify({
            success: false,
            message: 'Resource not found',
        }),
    };
};

/**
 * Generates a 409 Conflict response.
 * @param {string} message - A message to include in the response (optional)
 * @param {object} conflictDetails - Additional conflict details (optional)
 * @returns {object} - The structured 409 conflict response object
 */
const conflictResponse = (message = 'Conflict occurred', conflictDetails = {}) => {
    return {
        statusCode: 409,
        body: JSON.stringify({
            success: false,
            message,
            details: conflictDetails,  // Include conflict details if provided
        }),
    };
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    conflictResponse, 
};
