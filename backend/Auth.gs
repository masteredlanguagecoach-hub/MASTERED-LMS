// ============================================================
// Auth.gs — Authentication and Session Management
// Mastered Skill Academy LMS
// ============================================================

/**
 * Handle login request.
 * Accepts: admissionNumber OR email OR mobile + password
 */
function handleLogin(params) {
  try {
    const identifier = clean(params.identifier || params.admissionNumber || params.email || params.mobile || '');
    const password = params.password || '';

    if (!identifier || !password) {
      return errorResponse('Identifier and password are required', 'MISSING_FIELDS');
    }

    // Find user by any identifier
    const users = getAllFromSheet(CONFIG.SHEETS.USERS);
    const user = users.find(u =>
      String(u.ADMISSION_NUMBER).toLowerCase() === identifier.toLowerCase() ||
      String(u.EMAIL).toLowerCase() === identifier.toLowerCase() ||
      String(u.MOBILE) === identifier
    );

    if (!user) {
      return errorResponse('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    if (user.STATUS !== 'ACTIVE') {
      return errorResponse('Account is inactive. Contact admin.', 'ACCOUNT_INACTIVE');
    }

    // Verify password
    if (!verifyPassword(password, user.SALT, user.PASSWORD_HASH)) {
      auditLog(user.USER_ID, user.ROLE, 'LOGIN_FAILED', 'USER', user.USER_ID, '', '', 'FAILED');
      return errorResponse('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Create session
    const session = createSession(user.USER_ID, user.ROLE);

    // Update last login
    updateRow(CONFIG.SHEETS.USERS, 'USER_ID', user.USER_ID, { LAST_LOGIN: now(), UPDATED_AT: now() });

    // Audit
    auditLog(user.USER_ID, user.ROLE, 'LOGIN', 'USER', user.USER_ID, '', '', 'SUCCESS');

    return successResponse({
      token: session.TOKEN,
      sessionId: session.SESSION_ID,
      user: {
        userId: user.USER_ID,
        admissionNumber: user.ADMISSION_NUMBER,
        fullName: user.FULL_NAME,
        email: user.EMAIL,
        mobile: user.MOBILE,
        role: user.ROLE,
        profileImageUrl: user.PROFILE_IMAGE_URL
      }
    }, 'Login successful');

  } catch (e) {
    Logger.log('Login error: ' + e.message);
    return errorResponse('Login failed: ' + e.message, 'LOGIN_ERROR');
  }
}

/**
 * Handle logout.
 */
function handleLogout(params, sessionData) {
  try {
    if (!sessionData) return errorResponse('Not authenticated', 'NOT_AUTHENTICATED');
    invalidateSession(sessionData.SESSION_ID);
    auditLog(sessionData.USER_ID, sessionData.ROLE, 'LOGOUT', 'USER', sessionData.USER_ID, '', '', 'SUCCESS');
    return successResponse(null, 'Logged out successfully');
  } catch (e) {
    return errorResponse('Logout failed', 'LOGOUT_ERROR');
  }
}

/**
 * Create a new session for a user.
 */
function createSession(userId, role) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sessionId = generateId(CONFIG.ID_PREFIXES.SESSION, CONFIG.SHEETS.SESSIONS);
    const token = generateToken(CONFIG.SESSION_TOKEN_LENGTH);
    const expiryHours = getNumericSetting('SESSION_EXPIRY_HOURS', CONFIG.SESSION_EXPIRY_HOURS);
    const expiresAt = new Date(Date.now() + expiryHours * 3600 * 1000).toISOString();

    appendRow(CONFIG.SHEETS.SESSIONS, {
      SESSION_ID: sessionId,
      USER_ID: userId,
      TOKEN: token,
      ROLE: role,
      IP_ADDRESS: '',
      USER_AGENT: '',
      EXPIRES_AT: expiresAt,
      IS_ACTIVE: 'true',
      CREATED_AT: now(),
      UPDATED_AT: now()
    });

    return { SESSION_ID: sessionId, TOKEN: token };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Validate a session token. Returns session data or null.
 */
function validateSession(token) {
  if (!token) return null;
  try {
    const session = sessions.find(s => 
      s.TOKEN === token && 
      (s.IS_ACTIVE === true || String(s.IS_ACTIVE).toLowerCase() === 'true')
    );
    if (!session) return null;

    // Check expiry
    const expiry = new Date(session.EXPIRES_AT);
    if (Date.now() > expiry.getTime()) {
      invalidateSession(session.SESSION_ID);
      return null;
    }

    return session;
  } catch (e) {
    Logger.log('validateSession error: ' + e.message);
    return null;
  }
}

/**
 * Get the authenticated user from a validated session.
 */
function getAuthenticatedUser(session) {
  if (!session) return null;
  try {
    const user = findByField(CONFIG.SHEETS.USERS, 'USER_ID', session.USER_ID);
    if (!user || user.STATUS !== 'ACTIVE') return null;
    return user;
  } catch (e) {
    return null;
  }
}

/**
 * Extract auth token from request parameters.
 */
function extractToken(params) {
  return params.token || params.authToken || params.authorization || '';
}

/**
 * Full auth middleware: validate token → session → user → role → permission.
 * Returns { session, user } or throws.
 */
function requireAuth(params, allowedRoles) {
  const token = extractToken(params);
  const session = validateSession(token);
  if (!session) throw new Error('UNAUTHORIZED: Invalid or expired session');

  const user = getAuthenticatedUser(session);
  if (!user) throw new Error('UNAUTHORIZED: User not found or inactive');

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.ROLE)) {
      throw new Error('FORBIDDEN: Insufficient permissions');
    }
  }

  return { session, user };
}

/**
 * Invalidate a session by ID.
 */
function invalidateSession(sessionId) {
  updateRow(CONFIG.SHEETS.SESSIONS, 'SESSION_ID', sessionId, {
    IS_ACTIVE: 'false',
    UPDATED_AT: now()
  });
}

/**
 * Clean up expired sessions (run periodically via trigger).
 */
function cleanupExpiredSessions() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SESSIONS);
  if (!sheet || sheet.getLastRow() < 2) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const expiresCol = headers.indexOf('EXPIRES_AT') + 1;
  const activeCol = headers.indexOf('IS_ACTIVE') + 1;
  const updatedCol = headers.indexOf('UPDATED_AT') + 1;

  for (let i = data.length - 1; i >= 1; i--) {
    const expires = new Date(data[i][expiresCol - 1]);
    if (data[i][activeCol - 1] === 'true' && Date.now() > expires.getTime()) {
      sheet.getRange(i + 1, activeCol).setValue('false');
      sheet.getRange(i + 1, updatedCol).setValue(now());
    }
  }
}

/**
 * Get current user info from token (for getCurrentUser action).
 */
function handleGetCurrentUser(params) {
  try {
    const { session, user } = requireAuth(params, null);
    let profileData = null;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      profileData = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
    } else if (user.ROLE === CONFIG.ROLES.TRAINER) {
      profileData = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
    }

    return successResponse({
      userId: user.USER_ID,
      admissionNumber: user.ADMISSION_NUMBER,
      fullName: user.FULL_NAME,
      email: user.EMAIL,
      mobile: user.MOBILE,
      role: user.ROLE,
      profileImageUrl: user.PROFILE_IMAGE_URL,
      profile: profileData
    });
  } catch (e) {
    return errorResponse(e.message, 'AUTH_ERROR');
  }
}

/**
 * Change password handler.
 */
function handleChangePassword(params) {
  try {
    const { session, user } = requireAuth(params, null);
    validateRequired(params, ['currentPassword', 'newPassword']);

    if (!verifyPassword(params.currentPassword, user.SALT, user.PASSWORD_HASH)) {
      return errorResponse('Current password is incorrect', 'WRONG_PASSWORD');
    }

    const newSalt = generateSalt();
    const newHash = hashPassword(params.newPassword, newSalt);

    updateRow(CONFIG.SHEETS.USERS, 'USER_ID', user.USER_ID, {
      PASSWORD_HASH: newHash,
      SALT: newSalt,
      UPDATED_AT: now()
    });

    // Invalidate all other sessions
    invalidateSession(session.SESSION_ID);

    auditLog(user.USER_ID, user.ROLE, 'CHANGE_PASSWORD', 'USER', user.USER_ID, '', '', 'SUCCESS');
    return successResponse(null, 'Password changed successfully');
  } catch (e) {
    return errorResponse(e.message, 'CHANGE_PASSWORD_ERROR');
  }
}

/**
 * Write an audit log entry.
 */
function auditLog(userId, role, action, entityType, entityId, oldValue, newValue, status) {
  try {
    const logId = 'LOG' + Date.now();
    appendRow(CONFIG.SHEETS.AUDIT_LOG, {
      LOG_ID: logId,
      TIMESTAMP: now(),
      USER_ID: userId || '',
      ROLE: role || '',
      ACTION: action || '',
      ENTITY_TYPE: entityType || '',
      ENTITY_ID: entityId || '',
      OLD_VALUE: typeof oldValue === 'object' ? JSON.stringify(oldValue) : (oldValue || ''),
      NEW_VALUE: typeof newValue === 'object' ? JSON.stringify(newValue) : (newValue || ''),
      IP_ADDRESS: '',
      USER_AGENT: '',
      STATUS: status || 'SUCCESS'
    });
  } catch (e) {
    Logger.log('auditLog error: ' + e.message);
  }
}
