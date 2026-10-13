/**
 * @fileoverview Response utilities - Standardized API responses
 */

/**
 * Creates standardized error response
 * @param {string} error - Error type
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Formatted error response
 */
export function createErrorResponse(error, message, status = 400) {
  return {
    response: { error, message },
    status
  };
}

/**
 * Creates standardized success response  
 * @param {Object|string} dataOrMessage - Response data or message
 * @param {Object|number} dataOrStatus - Additional data or status code
 * @param {number} status - HTTP status code (when first param is message)
 * @returns {Object} Formatted success response
 */
export function createSuccessResponse(dataOrMessage = {}, dataOrStatus = 200, status = 200) {
  // Handle legacy signature: (message, data, status)
  if (typeof dataOrMessage === 'string' && typeof dataOrStatus === 'object') {
    return {
      response: { success: true, message: dataOrMessage, ...dataOrStatus },
      status
    };
  }
  
  // Handle new signature: (data, status)
  const finalStatus = typeof dataOrStatus === 'number' ? dataOrStatus : status;
  const response = typeof dataOrMessage === 'string' 
    ? { success: true, message: dataOrMessage }
    : { success: true, ...dataOrMessage };
    
  return {
    response,
    status: finalStatus
  };
}