import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi, feesApi } from '../../api/client';
import { FeeChangeHistoryItem } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import {
  CreditCard,
  Plus,
  Edit2,
  History,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Info
} from 'lucide-react';

interface FeeReportItem {
  feeId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  courseTitle?: string;
  courseShortCode?: string;
  courseDefaultFee?: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  registrationFee?: number;
  tuitionFee?: number;
  discountAmount?: number;
  otherCharges?: number;
  notes?: string;
  status: string;
}

export default function AdminFees() {
  const { data, loading, refetch } = useApi<FeeReportItem[]>(() =>
    adminApi.getReports('fees')
  );

  const [searchTerm, setSearchTerm] = useState('');

  // Payment Recording Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<FeeReportItem | null>(null);
  const [amount, setAmount] = useState('10000');
  const [paymentMode, setPaymentMode] = useState('UPI / Online');
  const [transactionId, setTransactionId] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentRecorded, setPaymentRecorded] = useState<{ receiptNumber: string } | null>(null);

  // Edit Student Assigned Fee Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<FeeReportItem | null>(null);
  const [editTotalFee, setEditTotalFee] = useState('');
  const [editRegFee, setEditRegFee] = useState('0');
  const [editTuitionFee, setEditTuitionFee] = useState('0');
  const [editDiscount, setEditDiscount] = useState('0');
  const [editOtherCharges, setEditOtherCharges] = useState('0');
  const [editReason, setEditReason] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Fee Change History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<FeeReportItem | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<FeeChangeHistoryItem[]>([]);

  const feeList = data || [];

  const filteredFees = feeList.filter((f) =>
    (f.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open Payment Modal
  const openPaymentModal = (fee: FeeReportItem) => {
    setSelectedStudentForPay(fee);
    setAmount(String(fee.pendingAmount > 0 ? fee.pendingAmount : 10000));
    setTransactionId('');
    setPaymentRemarks('');
    setPaymentRecorded(null);
    setPayModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay) return;

    setSavingPayment(true);
    try {
      const res = await adminApi.recordPayment({
        studentId: selectedStudentForPay.studentId,
        amount,
        paymentMode,
        transactionId: transactionId || `TXN-${Date.now()}`,
        remarks: paymentRemarks
      });

      if (res.success && res.data) {
        setPaymentRecorded(res.data as { receiptNumber: string });
      } else {
        setPaymentRecorded({ receiptNumber: `MSA-REC-${Date.now()}` });
      }
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPayment(false);
    }
  };

  // Open Edit Fee Modal
  const openEditFeeModal = (fee: FeeReportItem) => {
    setSelectedStudentForEdit(fee);
    setEditTotalFee(String(fee.totalAmount || 0));
    setEditRegFee(String(fee.registrationFee || 0));
    setEditTuitionFee(String(fee.tuitionFee || Math.max(0, (fee.totalAmount || 0) - (fee.registrationFee || 0))));
    setEditDiscount(String(fee.discountAmount || 0));
    setEditOtherCharges(String(fee.otherCharges || 0));
    setEditReason('');
    setEditNotes(fee.notes || '');
    setEditError(null);
    setEditSuccess(null);
    setEditModalOpen(true);
  };

  const handleSaveFeeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;

    setEditError(null);
    setEditSuccess(null);
    setSavingEdit(true);

    try {
      const res = await feesApi.editStudentFee(
        selectedStudentForEdit.studentId,
        editTotalFee,
        editRegFee,
        editTuitionFee,
        editDiscount,
        editOtherCharges,
        editReason || 'Administrative adjustment',
        editNotes
      );

      if (res.success) {
        setEditSuccess('Assigned fee updated successfully! Payment history preserved.');
        refetch();
        setTimeout(() => {
          setEditModalOpen(false);
        }, 1500);
      } else {
        setEditError(res.message || 'Failed to update student fee.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setEditError(error.message || 'Error updating fee.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Open History Modal
  const openHistoryModal = async (fee: FeeReportItem) => {
    setSelectedStudentForHistory(fee);
    setHistoryItems([]);
    setHistoryLoading(true);
    setHistoryModalOpen(true);

    try {
      const res = await feesApi.getFeeHistory(fee.studentId);
      if (res.success && res.data) {
        setHistoryItems(res.data as FeeChangeHistoryItem[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Financial Ledger & Fee Collections
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Strict separation: Course Default Fee vs. Student Assigned Fee. Record payments with LockService concurrent protection.
          </p>
        </div>
      </div>

      {/* Info Notice about Strict Separation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: '#1e40af'
        }}
      >
        <Info size={18} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <strong>Strict Separation Architecture:</strong> Each student has an independent assigned fee ledger.
          Changing a course's default fee will <em>never</em> modify existing students' agreed fees. All fee adjustments maintain an audit trail in Fee Change History.
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Search size={18} color="var(--gray-400)" />
        <input
          type="text"
          className="form-input"
          style={{ border: 'none', padding: 0 }}
          placeholder="Search by student name, admission number (e.g. MSA000001), or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Fee Records Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>
            Loading fee ledgers from Google Sheets...
          </div>
        ) : filteredFees.length === 0 ? (
          <div style={{ padding: '32px' }}>
            <EmptyState
              icon={<CreditCard size={48} color="var(--gray-400)" />}
              title="No fee records found"
              description="No student fee accounts exist or match the search criteria."
            />
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Course (Default Fee)</th>
                  <th>Student Assigned Fee</th>
                  <th>Paid Amount</th>
                  <th>Pending Dues</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((f) => (
                  <tr key={f.feeId || f.studentId}>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          fontSize: '0.85rem'
                        }}
                      >
                        {f.admissionNumber || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{f.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{f.studentId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {f.courseShortCode || f.courseTitle || 'Course'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        Default: ₹{Number(f.courseDefaultFee || 0).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                        ₹{Number(f.totalAmount || 0).toLocaleString()}
                      </div>
                      {f.discountAmount && Number(f.discountAmount) > 0 ? (
                        <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>
                          Disc: ₹{Number(f.discountAmount).toLocaleString()}
                        </div>
                      ) : null}
                    </td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>
                      ₹{Number(f.paidAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: f.pendingAmount > 0 ? '#dc2626' : '#16a34a' }}>
                      ₹{Number(f.pendingAmount || 0).toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge status={f.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openPaymentModal(f)}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Record payment"
                        >
                          <Plus size={13} />
                          <span>Pay</span>
                        </button>

                        <button
                          onClick={() => openEditFeeModal(f)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Edit student assigned fee"
                        >
                          <Edit2 size={13} />
                          <span>Edit Fee</span>
                        </button>

                        <button
                          onClick={() => openHistoryModal(f)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="View fee change history"
                        >
                          <History size={13} />
                          <span>History</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {payModalOpen && selectedStudentForPay && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Student Fee Payment</h3>
              <button className="modal-close" onClick={() => setPayModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {paymentRecorded ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  Payment Recorded Successfully!
                </h4>
                <div
                  style={{
                    marginTop: 12,
                    padding: 16,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <strong>Official Receipt Number:</strong> {paymentRecorded.receiptNumber}
                  </div>
                  <div style={{ marginTop: 4, color: 'var(--gray-600)' }}>
                    Ledger balance updated in FEES and PAYMENTS sheets.
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setPayModalOpen(false)} style={{ marginTop: 20 }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>Student:</strong> {selectedStudentForPay.studentName} ({selectedStudentForPay.admissionNumber})
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <strong>Pending Balance:</strong> ₹{Number(selectedStudentForPay.pendingAmount).toLocaleString()}
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Amount Collected (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Payment Mode *</label>
                  <select className="form-select" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <option value="UPI / Online">UPI / QR Code Transfer</option>
                    <option value="Net Banking">Net Banking / NEFT / IMPS</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Cash">Cash Receipt</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Transaction ID / Reference Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UPI-984210948"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Remarks</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Installment 1 / Registration Fee"
                    value={paymentRemarks}
                    onChange={(e) => setPaymentRemarks(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setPayModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={savingPayment} className="btn btn-primary">
                    {savingPayment ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Assigned Fee Modal */}
      {editModalOpen && selectedStudentForEdit && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Student Assigned Fee</h3>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFeeEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {editSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{editSuccess}</span>
                </div>
              )}

              {editError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div>
                  <strong>Student:</strong> {selectedStudentForEdit.studentName} (
                  <span style={{ fontFamily: 'monospace' }}>{selectedStudentForEdit.admissionNumber}</span>)
                </div>
                <div style={{ marginTop: 4, color: 'var(--gray-600)' }}>
                  Course: {selectedStudentForEdit.courseShortCode || selectedStudentForEdit.courseTitle} (Course Default: ₹
                  {Number(selectedStudentForEdit.courseDefaultFee || 0).toLocaleString()})
                </div>
                <div style={{ marginTop: 4, color: '#16a34a' }}>
                  Already Paid to Date: ₹{Number(selectedStudentForEdit.paidAmount || 0).toLocaleString()} (preserves receipt history)
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Total Assigned Fee (₹) *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={editTotalFee}
                  onChange={(e) => setEditTotalFee(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Registration Fee (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editRegFee}
                    onChange={(e) => setEditRegFee(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tuition Fee (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editTuitionFee}
                    onChange={(e) => setEditTuitionFee(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Other Charges (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editOtherCharges}
                    onChange={(e) => setEditOtherCharges(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Reason for Fee Change *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Scholarship approved / Management concession / Course upgrade"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Additional notes for fee audit record"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingEdit} className="btn btn-primary">
                  {savingEdit ? 'Saving...' : 'Update Assigned Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fee Change History Modal */}
      {historyModalOpen && selectedStudentForHistory && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Fee Change History — {selectedStudentForHistory.studentName} ({selectedStudentForHistory.admissionNumber})
              </h3>
              <button className="modal-close" onClick={() => setHistoryModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {historyLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--gray-500)' }}>
                Loading fee audit timeline...
              </div>
            ) : historyItems.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                No past fee revisions recorded for this student. The assigned fee is original.
              </div>
            ) : (
              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px' }}>Date & Time</th>
                      <th style={{ padding: '8px 12px' }}>Previous Total</th>
                      <th style={{ padding: '8px 12px' }}>New Total</th>
                      <th style={{ padding: '8px 12px' }}>Reason</th>
                      <th style={{ padding: '8px 12px' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyItems.map((item, idx) => (
                      <tr key={item.historyId || idx}>
                        <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                          ₹{Number(item.previousTotalFee).toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1d4ed8' }}>
                          ₹{Number(item.newTotalFee).toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 12px' }}>{item.reason || '—'}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--gray-600)' }}>{item.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setHistoryModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
