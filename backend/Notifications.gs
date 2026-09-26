// ============================================================
// Notifications.gs — Notification handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetNotifications(params) {
  try {
    const { user } = requireAuth(params, null);
    const notifications = findAllByField(CONFIG.SHEETS.NOTIFICATIONS, 'USER_ID', user.USER_ID)
      .sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT));
    const unreadCount = notifications.filter(n => n.IS_READ !== 'true').length;
    return successResponse({ notifications, unreadCount });
  } catch (e) {
    return errorResponse(e.message, 'GET_NOTIFICATIONS_ERROR');
  }
}

function handleMarkNotificationRead(params) {
  try {
    const { user } = requireAuth(params, null);
    validateRequired(params, ['notificationId']);
    const notif = findByField(CONFIG.SHEETS.NOTIFICATIONS, 'NOTIFICATION_ID', params.notificationId);
    if (!notif || notif.USER_ID !== user.USER_ID) return errorResponse('Not found', 'NOT_FOUND');
    updateRow(CONFIG.SHEETS.NOTIFICATIONS, 'NOTIFICATION_ID', params.notificationId, {
      IS_READ: 'true', READ_AT: now()
    });
    return successResponse(null, 'Marked as read');
  } catch (e) {
    return errorResponse(e.message);
  }
}

function handleMarkAllNotificationsRead(params) {
  try {
    const { user } = requireAuth(params, null);
    const notifs = findAllByField(CONFIG.SHEETS.NOTIFICATIONS, 'USER_ID', user.USER_ID)
      .filter(n => n.IS_READ !== 'true');
    notifs.forEach(n => {
      updateRow(CONFIG.SHEETS.NOTIFICATIONS, 'NOTIFICATION_ID', n.NOTIFICATION_ID, {
        IS_READ: 'true', READ_AT: now()
      });
    });
    return successResponse(null, 'All notifications marked as read');
  } catch (e) {
    return errorResponse(e.message);
  }
}

function createNotification(userId, title, body, type, entityType, entityId) {
  try {
    const notifId = 'NTF' + Date.now() + Math.random().toString(36).substr(2, 5);
    appendRow(CONFIG.SHEETS.NOTIFICATIONS, {
      NOTIFICATION_ID: notifId, USER_ID: userId,
      TITLE: title, BODY: body, TYPE: type,
      ENTITY_TYPE: entityType, ENTITY_ID: entityId,
      IS_READ: 'false', READ_AT: '', CREATED_AT: now()
    });
  } catch (e) {
    Logger.log('createNotification error: ' + e.message);
  }
}
