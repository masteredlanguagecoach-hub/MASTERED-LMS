// ============================================================
// Users.gs — User management handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetUsers(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    const role = params.role || '';
    let users = getAllFromSheet(CONFIG.SHEETS.USERS);
    if (role) users = users.filter(u => u.ROLE === role);
    // Never return password hashes or salts
    const safe = users.map(u => sanitizeUser(u));
    return successResponse(safe);
  } catch (e) {
    return errorResponse(e.message, 'GET_USERS_ERROR');
  }
}

function handleCreateUser(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['fullName', 'email', 'mobile', 'role', 'password']);

    // Check duplicate
    const existing = findByField(CONFIG.SHEETS.USERS, 'EMAIL', params.email);
    if (existing) return errorResponse('Email already exists', 'DUPLICATE_EMAIL');

    const userId = generateId(CONFIG.ID_PREFIXES.USER, CONFIG.SHEETS.USERS);
    const admissionNumber = generateAdmissionNumber(params.role);
    const salt = generateSalt();
    const hash = hashPassword(params.password, salt);

    appendRow(CONFIG.SHEETS.USERS, {
      USER_ID: userId,
      ADMISSION_NUMBER: admissionNumber,
      EMAIL: clean(params.email),
      MOBILE: clean(params.mobile),
      PASSWORD_HASH: hash,
      SALT: salt,
      ROLE: params.role,
      STATUS: 'ACTIVE',
      FULL_NAME: clean(params.fullName),
      PROFILE_IMAGE_URL: '',
      EMAIL_VERIFIED: 'false',
      LAST_LOGIN: '',
      CREATED_AT: now(),
      UPDATED_AT: now()
    });

    auditLog(user.USER_ID, user.ROLE, 'CREATE_USER', 'USER', userId, '', params.email, 'SUCCESS');
    return successResponse({ userId, admissionNumber }, 'User created successfully');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_USER_ERROR');
  }
}

function handleUpdateUser(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['userId']);

    const updates = {};
    if (params.fullName) updates.FULL_NAME = clean(params.fullName);
    if (params.email) updates.EMAIL = clean(params.email);
    if (params.mobile) updates.MOBILE = clean(params.mobile);
    if (params.status) updates.STATUS = params.status;
    updates.UPDATED_AT = now();

    const oldUser = findByField(CONFIG.SHEETS.USERS, 'USER_ID', params.userId);
    updateRow(CONFIG.SHEETS.USERS, 'USER_ID', params.userId, updates);
    auditLog(user.USER_ID, user.ROLE, 'UPDATE_USER', 'USER', params.userId, oldUser, updates, 'SUCCESS');
    return successResponse(null, 'User updated');
  } catch (e) {
    return errorResponse(e.message, 'UPDATE_USER_ERROR');
  }
}

function handleResetPassword(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['userId', 'newPassword']);

    const salt = generateSalt();
    const hash = hashPassword(params.newPassword, salt);
    updateRow(CONFIG.SHEETS.USERS, 'USER_ID', params.userId, {
      PASSWORD_HASH: hash, SALT: salt, UPDATED_AT: now()
    });
    auditLog(user.USER_ID, user.ROLE, 'RESET_PASSWORD', 'USER', params.userId, '', '', 'SUCCESS');
    return successResponse(null, 'Password reset successfully');
  } catch (e) {
    return errorResponse(e.message, 'RESET_PASSWORD_ERROR');
  }
}

function generateAdmissionNumber(role) {
  const prefix = {
    ADMIN: 'ADM', TRAINER: 'TRN', STUDENT: 'STD', STAFF: 'STA'
  }[role] || 'USR';
  const users = getAllFromSheet(CONFIG.SHEETS.USERS).filter(u => u.ROLE === role);
  return prefix + String(users.length + 1).padStart(6, '0');
}

function sanitizeUser(user) {
  const u = Object.assign({}, user);
  delete u.PASSWORD_HASH;
  delete u.SALT;
  return u;
}
