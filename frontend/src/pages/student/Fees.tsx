import React from 'react';
import { useApi } from '../../hooks/useApi';
import { feesApi } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { CreditCard, Download, CalendarCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface FeeDataResponse {
  fee: {
    feeId: string;
    studentId: string;
    batchId: string;
    courseId: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    progressPercent: number;
    status: string;
  };
  installments: Array<{
    installmentId: string;
    feeId: string;
    studentId: string;
    installmentNumber: string;
    amount: string;
    dueDate: string;
    paidDate?: string;
    status: string;
    remarks: string;
  }>;
  payments: Array<{
    paymentId: string;
    feeId: string;
    studentId: string;
    amount: string;
    paymentDate: string;
    paymentMode: string;
    transactionId: string;
    status: string;
  }>;
  receipts: Array<{
    receiptId: string;
    receiptNumber: string;
    amount: string;
    issuedDate: string;
  }>;
}

export default function Fees() {
  const { data, loading } = useApi<FeeDataResponse>(() =>
    feesApi.getFees()
  );

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  if (!data || !data.fee) {
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
        <div className="card" style={{ padding: 40 }}>
          <EmptyState
            icon={<CreditCard size={48} color="var(--gray-400)" />}
            title="No Fee Record Found"
            description="Your student account does not have an active fee ledger assigned yet. Please contact the academy administration."
          />
        </div>
      </div>
    );
  }

  const f = data.fee;
  const installments = data.installments || [];
  const payments = data.payments || [];
  const receipts = data.receipts || [];

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
            Total Assigned Fee
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>
            ₹{Number(f.totalAmount || 0).toLocaleString()}
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
            ₹{Number(f.paidAmount || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
            Cleared via authorized payments
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
            Pending Balance
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: f.pendingAmount > 0 ? '#dc2626' : '#16a34a', marginTop: 4 }}>
            ₹{Number(f.pendingAmount || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
            {f.pendingAmount === 0 ? 'All fees settled' : 'Balance payable'}
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>
          <span>Overall Clearance Progress</span>
          <span>{f.progressPercent}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 5, overflow: 'hidden' }}>
          <div
            style={{
              width: `${f.progressPercent}%`,
              height: '100%',
              background: f.progressPercent === 100 ? '#16a34a' : 'var(--primary)',
              borderRadius: 5,
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Installment Schedule */}
      {installments.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Agreed Installment Schedule
            </h3>
          </div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((ins) => (
                  <tr key={ins.installmentId}>
                    <td style={{ fontWeight: 600 }}>Inst {ins.installmentNumber}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(ins.amount).toLocaleString()}</td>
                    <td>{new Date(ins.dueDate).toLocaleDateString()}</td>
                    <td>{ins.paidDate ? new Date(ins.paidDate).toLocaleDateString() : '—'}</td>
                    <td><StatusBadge status={ins.status} /></td>
                    <td style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{ins.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Receipts History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Official Payment Transactions & Receipts
          </h3>
        </div>
        {payments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            No payments recorded on this account yet.
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.transactionId || p.paymentId}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>₹{Number(p.amount).toLocaleString()}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>{p.paymentMode}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
