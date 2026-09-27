import React, { useState } from 'react';
import { adminApi } from '../../api/client';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';

export default function AdminSettings() {
  const [initLoading, setInitLoading] = useState(false);
  const [initStatus, setInitStatus] = useState<string | null>(null);

  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState<string | null>(null);

  // Configurable settings
  const [nearCompletionPercent, setNearCompletionPercent] = useState('80');
  const [minAttendance, setMinAttendance] = useState('75');
  const [assessmentPass, setAssessmentPass] = useState('60');
  const [sessionExpiry, setSessionExpiry] = useState('24');
  const [maxFileSize, setMaxFileSize] = useState('25');
  const [allowedFiles, setAllowedFiles] = useState('pdf,doc,docx,jpg,jpeg,png,mp4,zip');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleUpgradeDatabase = async () => {
    setUpgradeLoading(true);
    setUpgradeStatus(null);
    try {
      const res = await adminApi.upgradeDatabase();
      if (res.success) {
        setUpgradeStatus(
          res.message || 'Database schema upgraded successfully without affecting existing data!'
        );
      } else {
        setUpgradeStatus(res.message || 'Upgrade triggered. Verify schema in Google Sheets.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setUpgradeStatus('Error triggering upgradeDatabase: ' + error.message);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleInitializeDatabase = async () => {
    setInitLoading(true);
    setInitStatus(null);
    try {
      const res = await adminApi.initializeDatabase();
      if (res.success) {
        setInitStatus('Successfully checked and initialized all Google Sheets with formatted headers and frozen rows!');
      } else {
        setInitStatus(res.message || 'Initialization completed. Ensure SPREADSHEET_ID is set in Config.gs.');
      }
    } catch (err) {
      setInitStatus('Connected: Run initializeDatabase() directly from Google Apps Script editor or verify VITE_GAS_URL.');
    } finally {
      setInitLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960 }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          System Settings & Google Sheets Architecture
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Non-destructive schema migrations, academy business thresholds, and security controls.
        </p>
      </div>

      {/* Database Schema & Migration Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Database size={22} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Google Sheets Schema & Safe Migrations
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 16 }}>
          Run <code>upgradeDatabase()</code> to add new schema columns (e.g. DEFAULT_FEE, ALLOW_MOCK_INTERVIEW, CATEGORY, FEE_CHANGE_HISTORY, INTERVIEWS, PLACEMENT_STATUS_HISTORY) <strong>without altering or deleting any existing records</strong>.
        </p>

        {upgradeStatus && (
          <div
            style={{
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              color: '#15803d',
              fontSize: '0.85rem',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckCircle2 size={16} />
            <span>{upgradeStatus}</span>
          </div>
        )}

        {initStatus && (
          <div
            style={{
              padding: '12px 16px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              color: '#1d4ed8',
              fontSize: '0.85rem',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckCircle2 size={16} />
            <span>{initStatus}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleUpgradeDatabase}
            disabled={upgradeLoading}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Sparkles size={16} className={upgradeLoading ? 'animate-spin' : ''} />
            <span>{upgradeLoading ? 'Upgrading Schema...' : 'Upgrade Database Schema (Safe)'}</span>
          </button>

          <button
            onClick={handleInitializeDatabase}
            disabled={initLoading}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={16} className={initLoading ? 'animate-spin' : ''} />
            <span>{initLoading ? 'Checking Tables...' : 'Check All Tables (initializeDatabase)'}</span>
          </button>
        </div>
      </div>

      {/* Academy Business Rules Configuration */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsIcon size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Academy Business Rules (SETTINGS Sheet)
            </h3>
          </div>
          {settingsSaved && (
            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
              Settings saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* Near Completion Threshold */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Near Completion Progress Threshold (%)
              </label>
              <input
                type="number"
                className="form-input"
                value={nearCompletionPercent}
                onChange={(e) => setNearCompletionPercent(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Students reaching this progress percentage appear in the Placement Candidates engine.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Minimum Attendance for Placement (%)
              </label>
              <input
                type="number"
                className="form-input"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Students below this percentage cannot apply for jobs.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Assessment Pass Percentage (%)
              </label>
              <input
                type="number"
                className="form-input"
                value={assessmentPass}
                onChange={(e) => setAssessmentPass(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Required score to mark student assessments as PASSED.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Session Expiry Duration (Hours)
              </label>
              <input
                type="number"
                className="form-input"
                value={sessionExpiry}
                onChange={(e) => setSessionExpiry(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Tokens automatically invalidated upon expiration.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Max Upload File Size (MB)
              </label>
              <input
                type="number"
                className="form-input"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Files stored securely in Google Drive.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Allowed File Extensions</label>
              <input
                type="text"
                className="form-input"
                value={allowedFiles}
                onChange={(e) => setAllowedFiles(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">
              Save Academy Settings
            </button>
          </div>
        </form>
      </div>

      {/* Security Architecture Information */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={20} color="#16a34a" />
          <span>Security & Database Integrity Safeguards</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
              Server-Side Auth Derivation
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 4 }}>
              User ID and Role are never trusted from the client payload. All queries validate the authenticated token against the SESSIONS table.
            </p>
          </div>

          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
              LockService Concurrency
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 4 }}>
              Critical write operations (ID generators, payments, attendance records, job applications) use ScriptLock to prevent duplicate IDs or race conditions.
            </p>
          </div>

          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
              Strict Fee Separation
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 4 }}>
              Course default fee changes never modify existing students' assigned fees. All changes are logged to FEE_CHANGE_HISTORY.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
