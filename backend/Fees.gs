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
    const course = findByField(CONFIG.SHEETS.COURSES, 'COURSE_ID', fee.COURSE_ID);

    const totalAmount = parseFloat(fee.TOTAL_AMOUNT) || 0;
    const paidAmount = parseFloat(fee.PAID_AMOUNT) || 0;
    const pendingAmount = parseFloat(fee.PENDING_AMOUNT) || 0;
    const registrationFee = parseFloat(fee.REGISTRATION_FEE) || 0;
    const tuitionFee = parseFloat(fee.TUITION_FEE) || 0;
    const discountAmount = parseFloat(fee.DISCOUNT_AMOUNT) || 0;
    const otherCharges = parseFloat(fee.OTHER_CHARGES) || 0;
    const courseDefaultFee = course && course.DEFAULT_FEE ? parseFloat(course.DEFAULT_FEE) : totalAmount;
    const progressPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    return successResponse({
      fee: {
        ...fee,
        totalAmount,
        paidAmount,
        pendingAmount,
        registrationFee,
        tuitionFee,
        discountAmount,
        otherCharges,
        courseDefaultFee,
        notes: fee.NOTES || '',
        progressPercent
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

/**
 * Admin edit student assigned fee.
 * Affects ONLY this student.
 * Does NOT modify course default fee, other students, or existing payment history.
 * Recalculates pending dues and logs to FEE_CHANGE_HISTORY and AUDIT_LOG.
 */
function handleEditStudentFee(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['studentId', 'totalAmount']);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', params.studentId);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');

      let fee = findByField(CONFIG.SHEETS.FEES, 'STUDENT_ID', params.studentId);
      if (!fee) return errorResponse('Fee record not found for student', 'NOT_FOUND');

      const oldTotal = parseFloat(fee.TOTAL_AMOUNT) || 0;
      const newTotal = parseFloat(params.totalAmount);
      if (isNaN(newTotal) || newTotal < 0) {
        return errorResponse('Total assigned fee must be a valid non-negative number', 'INVALID_AMOUNT');
      }

      // Preserve existing payments completely
      const currentPaid = parseFloat(fee.PAID_AMOUNT) || 0;
      const newPending = Math.max(0, newTotal - currentPaid);
      const newStatus = newPending <= 0 ? 'PAID' : (currentPaid > 0 ? 'PARTIAL' : 'PENDING');

      const feeUpdates = {
        TOTAL_AMOUNT: String(newTotal),
        PENDING_AMOUNT: String(newPending),
        STATUS: newStatus,
        UPDATED_AT: now()
      };

      if (params.registrationFee !== undefined) {
        feeUpdates.REGISTRATION_FEE = String(parseFloat(params.registrationFee) || 0);
      }
      if (params.tuitionFee !== undefined) {
        feeUpdates.TUITION_FEE = String(parseFloat(params.tuitionFee) || 0);
      }
      if (params.discountAmount !== undefined) {
        feeUpdates.DISCOUNT_AMOUNT = String(parseFloat(params.discountAmount) || 0);
      }
      if (params.discountReason !== undefined) {
        feeUpdates.DISCOUNT_REASON = clean(params.discountReason);
      }
      if (params.otherCharges !== undefined) {
        feeUpdates.OTHER_CHARGES = String(parseFloat(params.otherCharges) || 0);
      }
      if (params.notes !== undefined) {
        feeUpdates.NOTES = clean(params.notes);
      }

      updateRow(CONFIG.SHEETS.FEES, 'FEE_ID', fee.FEE_ID, feeUpdates);

      // Save fee change history record
      const fchId = generateId(CONFIG.ID_PREFIXES.FEE_HISTORY, CONFIG.SHEETS.FEE_CHANGE_HISTORY);
      appendRow(CONFIG.SHEETS.FEE_CHANGE_HISTORY, {
        FCH_ID: fchId,
        STUDENT_ID: student.STUDENT_ID,
        FEE_ID: fee.FEE_ID,
        OLD_FEE: String(oldTotal),
        NEW_FEE: String(newTotal),
        CHANGED_BY: user.FULL_NAME || user.USER_ID,
        CHANGED_DATE: now(),
        REASON: clean(params.reason || 'Fee updated by admin'),
        CREATED_AT: now()
      });

      auditLog(user.USER_ID, user.ROLE, 'EDIT_STUDENT_FEE', 'FEE', fee.FEE_ID, String(oldTotal), String(newTotal), 'SUCCESS');

      return successResponse({
        feeId: fee.FEE_ID,
        studentId: student.STUDENT_ID,
        oldTotal,
        newTotal,
        paidAmount: currentPaid,
        pendingAmount: newPending,
        status: newStatus
      }, 'Student assigned fee updated successfully');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return errorResponse(e.message, 'EDIT_STUDENT_FEE_ERROR');
  }
}

/**
 * Get fee change history for a student.
 */
function handleGetFeeHistory(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF, CONFIG.ROLES.STUDENT]);
    let studentId = params.studentId || '';

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    if (!studentId) return errorResponse('studentId required', 'MISSING_FIELD');

    const history = findAllByField(CONFIG.SHEETS.FEE_CHANGE_HISTORY, 'STUDENT_ID', studentId)
      .sort((a, b) => new Date(b.CHANGED_DATE || b.CREATED_AT).getTime() - new Date(a.CHANGED_DATE || a.CREATED_AT).getTime());

    return successResponse(history);
  } catch (e) {
    return errorResponse(e.message, 'GET_FEE_HISTORY_ERROR');
  }
}
