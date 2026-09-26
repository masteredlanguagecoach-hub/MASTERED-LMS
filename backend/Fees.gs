// ============================================================
// Fees.gs — Fee and installment handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetFees(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    } else if (!studentId) {
      return errorResponse('studentId required', 'MISSING_FIELD');
    }

    const fee = findByField(CONFIG.SHEETS.FEES, 'STUDENT_ID', studentId);
    if (!fee) return successResponse(null, 'No fee record found');

    const installments = findAllByField(CONFIG.SHEETS.FEE_INSTALLMENTS, 'FEE_ID', fee.FEE_ID);
    const payments = findAllByField(CONFIG.SHEETS.PAYMENTS, 'FEE_ID', fee.FEE_ID);
    const receipts = findAllByField(CONFIG.SHEETS.RECEIPTS, 'STUDENT_ID', studentId);

    const totalAmount = parseFloat(fee.TOTAL_AMOUNT) || 0;
    const paidAmount = parseFloat(fee.PAID_AMOUNT) || 0;
    const pendingAmount = parseFloat(fee.PENDING_AMOUNT) || 0;
    const progressPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    return successResponse({
      fee: {
        ...fee,
        totalAmount, paidAmount, pendingAmount, progressPercent
      },
      installments,
      payments,
      receipts
    });
  } catch (e) {
    return errorResponse(e.message, 'GET_FEES_ERROR');
  }
}

function handleGetInstallments(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    const installments = findAllByField(CONFIG.SHEETS.FEE_INSTALLMENTS, 'STUDENT_ID', studentId)
      .sort((a, b) => parseInt(a.INSTALLMENT_NUMBER) - parseInt(b.INSTALLMENT_NUMBER));
    return successResponse(installments);
  } catch (e) {
    return errorResponse(e.message, 'GET_INSTALLMENTS_ERROR');
  }
}

function handleRecordPayment(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['studentId', 'amount', 'paymentMode']);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const fee = findByField(CONFIG.SHEETS.FEES, 'STUDENT_ID', params.studentId);
      if (!fee) return errorResponse('Fee record not found', 'NOT_FOUND');

      const paymentId = generateId(CONFIG.ID_PREFIXES.PAYMENT, CONFIG.SHEETS.PAYMENTS);
      const amount = parseFloat(params.amount);

      appendRow(CONFIG.SHEETS.PAYMENTS, {
        PAYMENT_ID: paymentId, FEE_ID: fee.FEE_ID,
        INSTALLMENT_ID: params.installmentId || '',
        STUDENT_ID: params.studentId, AMOUNT: String(amount),
        PAYMENT_DATE: params.paymentDate || now(),
        PAYMENT_MODE: params.paymentMode, TRANSACTION_ID: params.transactionId || '',
        COLLECTED_BY: user.USER_ID, STATUS: 'COMPLETED',
        REMARKS: params.remarks || '', CREATED_AT: now(), UPDATED_AT: now()
      });

      // Update fee totals
      const newPaid = parseFloat(fee.PAID_AMOUNT) + amount;
      const newPending = parseFloat(fee.TOTAL_AMOUNT) - newPaid;
      const newStatus = newPending <= 0 ? 'PAID' : 'PARTIAL';

      updateRow(CONFIG.SHEETS.FEES, 'FEE_ID', fee.FEE_ID, {
        PAID_AMOUNT: String(newPaid), PENDING_AMOUNT: String(Math.max(0, newPending)),
        STATUS: newStatus, UPDATED_AT: now()
      });

      // Update installment if provided
      if (params.installmentId) {
        updateRow(CONFIG.SHEETS.FEE_INSTALLMENTS, 'INSTALLMENT_ID', params.installmentId, {
          STATUS: 'PAID', PAID_DATE: now(), UPDATED_AT: now()
        });
      }

      // Generate receipt
      const receiptId = generateId(CONFIG.ID_PREFIXES.RECEIPT, CONFIG.SHEETS.RECEIPTS);
      const receiptNumber = 'RCP' + Date.now();
      appendRow(CONFIG.SHEETS.RECEIPTS, {
        RECEIPT_ID: receiptId, PAYMENT_ID: paymentId,
        STUDENT_ID: params.studentId, RECEIPT_NUMBER: receiptNumber,
        AMOUNT: String(amount), ISSUED_DATE: now(),
        FILE_URL: '', CREATED_AT: now()
      });

      auditLog(user.USER_ID, user.ROLE, 'RECORD_PAYMENT', 'PAYMENT', paymentId, '', String(amount), 'SUCCESS');
      return successResponse({ paymentId, receiptId, receiptNumber }, 'Payment recorded');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return errorResponse(e.message, 'RECORD_PAYMENT_ERROR');
  }
}

function handleGetPayments(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    const payments = findAllByField(CONFIG.SHEETS.PAYMENTS, 'STUDENT_ID', studentId)
      .sort((a, b) => new Date(b.PAYMENT_DATE) - new Date(a.PAYMENT_DATE));
    return successResponse(payments);
  } catch (e) {
    return errorResponse(e.message, 'GET_PAYMENTS_ERROR');
  }
}
