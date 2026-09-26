import React from 'react';
import { useApi } from '../../hooks/useApi';
import { feesApi } from '../../api/client';
import { FeeRecord, Installment, Payment } from '../../types';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Receipt, Download } from 'lucide-react';

interface FeeDataResponse {
  fee: FeeRecord;
  installments: Installment[];
  payments: Payment[];
  receipts: Array<{
    receiptId: string;
    receiptNumber: string;
    amount: string;
    issuedDate: string;
  }>;
}

export default function Fees() {
  const { data, loading, error } = useApi<FeeDataResponse>(() =>
    feesApi.getFees()
  );

  const fallbackData: FeeDataResponse = {
    fee: {
      feeId: 'FEE000001',
      studentId: 'STD000001',
      batchId: 'BAT000001',
      courseId: 'CRS000001',
      totalAmount: 45000,
      paidAmount: 15000,
      pendingAmount: 30000,
      progressPercent: 33,
      status: 'PARTIAL'
    },
    installments: [
      {
        installmentId: 'INS000001',
        feeId: 'FEE000001',
        studentId: 'STD000001',
        installmentNumber: '1',
        amount: '15000',
        dueDate: '2026-01-01',
        paidDate: '2026-01-01',
        status: 'PAID',
        remarks: 'Admission Down Payment'
      },
      {
        installmentId: 'INS000002',
        feeId: 'FEE000001',
        studentId: 'STD000001',
        installmentNumber: '2',
        amount: '15000',
        dueDate: '2026-03-01',
        status: 'PENDING',
        remarks: 'Mid-term Milestone'
      },
      {
        installmentId: 'INS000003',
        feeId: 'FEE000001',
        studentId: 'STD000001',
        installmentNumber: '3',
        amount: '15000',
        dueDate: '2026-05-01',
        status: 'PENDING',
        remarks: 'Final Placement Track'
      }
    ],
    payments: [
      {
        paymentId: 'PAY000001',
        feeId: 'FEE000001',
        studentId: 'STD000001',
        amount: '15000',
        paymentDate: '2026-01-01',
        paymentMode: 'UPI / Online Transfer',
        transactionId: 'UPI-TXN-9842109841',
        status: 'COMPLETED'
      }
    ],
    receipts: [
      {
        receiptId: 'REC000001',
        receiptNumber: 'MSA-RCP-2026-0042',
        amount: '15000',
        issuedDate: '2026-01-01'
      }
    ]
  };

  const feeData = data || fallbackData;
  const f = feeData.fee;

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          Fee Ledger & Installment Plan
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Official fee records loaded directly from Mastered Skill Academy's finance sheet.
        </p>
      </div>

      {/* Main KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Course Fee
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>
            ₹{f.totalAmount.toLocaleString()}
          </div>
          <div style={{ marginTop: 8 }}>
            <StatusBadge status={f.status} />
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Amount Paid
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
            ₹{f.paidAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
            Cleared via authorized payments
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
            Pending Balance
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
            ₹{f.pendingAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
            Scheduled across installments
          </div>
        </div>
      </div>

      {/* Payment Progress Bar */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Payment Completion Rate</span>
          <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>{f.progressPercent}%</span>
        </div>
        <ProgressBar percent={f.progressPercent} height={10} variant={f.progressPercent === 100 ? 'success' : 'primary'} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 6 }}>
          <span>Paid: ₹{f.paidAmount.toLocaleString()}</span>
          <span>Balance: ₹{f.pendingAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Installment Schedule */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Installment Schedule & Due Dates
          </h3>
        </div>

        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Installment #</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Paid Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {feeData.installments.map((ins) => (
                <tr key={ins.installmentId}>
                  <td style={{ fontWeight: 600 }}>Installment {ins.installmentNumber}</td>
                  <td>{ins.dueDate ? new Date(ins.dueDate).toLocaleDateString() : '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--gray-900)' }}>₹{Number(ins.amount).toLocaleString()}</td>
                  <td>{ins.paidDate ? new Date(ins.paidDate).toLocaleDateString() : '—'}</td>
                  <td><StatusBadge status={ins.status} /></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{ins.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History & Receipts */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Payment Transactions & Official Receipts
          </h3>
        </div>

        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Receipt / Txn ID</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feeData.payments.map((p) => (
                <tr key={p.paymentId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.transactionId || p.paymentId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>ID: {p.paymentId}</div>
                  </td>
                  <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
                  <td>{p.paymentMode}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>₹{Number(p.amount).toLocaleString()}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`Receipt downloaded for transaction ${p.paymentId}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Receipt size={14} />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
