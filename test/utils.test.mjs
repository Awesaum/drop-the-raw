import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  sanitizeEmail,
  validateRequiredFields,
  createErrorResponse,
  createSuccessResponse
} from '../src/utils/index.js';

test('Utils module tests', async (t) => {
  await t.test('validateEmail validates email formats', () => {
    // Valid emails
    assert.equal(validateEmail('test@example.com'), true);
    assert.equal(validateEmail('user.name@domain.co.uk'), true);
    assert.equal(validateEmail('name+tag@example.org'), true);

    // Invalid emails
    assert.equal(validateEmail(''), false);
    assert.equal(validateEmail('invalid'), false);
    assert.equal(validateEmail('invalid@'), false);
    assert.equal(validateEmail('@invalid.com'), false);
    assert.equal(validateEmail('invalid..email@test.com'), false);
    assert.equal(validateEmail('test@.com'), false);
    assert.equal(validateEmail('test.@com'), false);
    assert.equal(validateEmail(null), false);
    assert.equal(validateEmail(undefined), false);
  });

  await t.test('sanitizeEmail normalizes valid emails', () => {
    assert.equal(sanitizeEmail('  TEST@EXAMPLE.COM  '), 'test@example.com');
    assert.equal(sanitizeEmail('User@Domain.Org'), 'user@domain.org');
    assert.equal(sanitizeEmail('invalid'), '');
    assert.equal(sanitizeEmail(''), '');
  });

  await t.test('validateRequiredFields checks for missing fields', () => {
    const body = { email: 'test@example.com', name: 'John' };
    
    const result1 = validateRequiredFields(body, ['email']);
    assert.equal(result1.valid, true);
    assert.deepEqual(result1.missing, []);

    const result2 = validateRequiredFields(body, ['email', 'phone']);
    assert.equal(result2.valid, false);
    assert.deepEqual(result2.missing, ['phone']);

    const result3 = validateRequiredFields({}, ['email', 'name']);
    assert.equal(result3.valid, false);
    assert.deepEqual(result3.missing, ['email', 'name']);
  });

  await t.test('createErrorResponse formats error responses', () => {
    const error = createErrorResponse('Validation Error', 'Email is required', 400);
    assert.equal(error.status, 400);
    assert.equal(error.response.error, 'Validation Error');
    assert.equal(error.response.message, 'Email is required');
  });

  await t.test('createSuccessResponse formats success responses', () => {
    const success = createSuccessResponse('Operation successful', { id: 123 }, 201);
    assert.equal(success.status, 201);
    assert.equal(success.response.success, true);
    assert.equal(success.response.message, 'Operation successful');
    assert.equal(success.response.id, 123);
  });
});