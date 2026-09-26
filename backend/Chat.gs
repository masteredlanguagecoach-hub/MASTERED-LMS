// ============================================================
// Chat.gs — Batch chat message handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetChatMessages(params) {
  try {
    const { user } = requireAuth(params, null);
    let batchId = params.batchId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      batchId = student.BATCH_ID;
    }

    if (!batchId) return errorResponse('batchId required', 'MISSING_FIELD');

    const messages = findAllByField(CONFIG.SHEETS.CHAT_MESSAGES, 'BATCH_ID', batchId)
      .filter(m => m.STATUS !== 'DELETED')
      .sort((a, b) => new Date(a.CREATED_AT) - new Date(b.CREATED_AT));

    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 50;
    const start = Math.max(0, messages.length - page * pageSize);
    const end = messages.length - (page - 1) * pageSize;
    const paged = messages.slice(start, end);

    return successResponse({ messages: paged, total: messages.length, page, pageSize });
  } catch (e) {
    return errorResponse(e.message, 'GET_CHAT_ERROR');
  }
}

function handleSendChatMessage(params) {
  try {
    const { user } = requireAuth(params, null);
    validateRequired(params, ['batchId', 'messageText']);

    // Verify user has access to this batch
    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student || student.BATCH_ID !== params.batchId) {
        return errorResponse('Not authorized for this batch', 'FORBIDDEN');
      }
    }

    const messageId = generateId(CONFIG.ID_PREFIXES.MESSAGE, CONFIG.SHEETS.CHAT_MESSAGES);
    appendRow(CONFIG.SHEETS.CHAT_MESSAGES, {
      MESSAGE_ID: messageId, BATCH_ID: params.batchId,
      SENDER_ID: user.USER_ID, SENDER_NAME: user.FULL_NAME,
      SENDER_ROLE: user.ROLE, MESSAGE_TEXT: clean(params.messageText),
      FILE_URL: params.fileUrl || '', FILE_NAME: params.fileName || '',
      MESSAGE_TYPE: params.messageType || 'TEXT',
      REPLY_TO: params.replyTo || '', STATUS: 'ACTIVE',
      CREATED_AT: now(), UPDATED_AT: now()
    });

    return successResponse({ messageId }, 'Message sent');
  } catch (e) {
    return errorResponse(e.message, 'SEND_CHAT_ERROR');
  }
}

function handleGetAnnouncements(params) {
  try {
    const { user } = requireAuth(params, null);
    let batchId = params.batchId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      batchId = student.BATCH_ID;
    }

    let announcements = batchId
      ? findAllByField(CONFIG.SHEETS.ANNOUNCEMENTS, 'BATCH_ID', batchId)
      : getAllFromSheet(CONFIG.SHEETS.ANNOUNCEMENTS);

    announcements = announcements
      .filter(a => a.STATUS === 'ACTIVE')
      .sort((a, b) => new Date(b.PUBLISHED_AT) - new Date(a.PUBLISHED_AT));

    return successResponse(announcements);
  } catch (e) {
    return errorResponse(e.message, 'GET_ANNOUNCEMENTS_ERROR');
  }
}
