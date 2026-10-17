import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  authApi, 
  incidentApi, 
  type UserSummaryDto, 
  type IncidentResponse,
  type RegisterUserPayload 
} from '../../services/api';
import { IncidentDetailModal } from '../incident/IncidentDetailModal';

export const AdminWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'USERS' | 'TELEMETRY'>(() => {
    if (typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('tab');
      if (t === 'USERS' || t === 'TELEMETRY') return t;
    }
    return 'INCIDENTS';
  });

  // Incidents state
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentResponse | null>(null);

  // Users Directory state (real integration with GET /api/v1/users)
  const [users, setUsers] = useState<UserSummaryDto[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Create User Modal state (real integration with POST /api/v1/users/admin)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<RegisterUserPayload>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    department: '',
    role: 'ROLE_TECHNICIAN'
  });
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Fetch all incidents across system
  const fetchAllIncidents = useCallback(async () => {
    setIsLoadingIncidents(true);
    try {
      const data = await incidentApi.getIncidents({ page: 0, size: 50, sortBy: 'createdAt', direction: 'DESC' });
      setIncidents(data.content || []);
    } catch {
      setIncidents([]);
    } finally {
      setIsLoadingIncidents(false);
    }
  }, []);

  // Fetch system users directory (GET /api/v1/users)
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUserError(null);
    try {
      const data = await authApi.getAllUsers(0, 50);
      setUsers(data.content || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch users';
      setUserError(msg);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchAllIncidents();
  }, [fetchAllIncidents]);

  useEffect(() => {
    if (activeTab === 'USERS') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  // Create User by Admin (POST /api/v1/users/admin)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);
    setCreateUserSuccess(null);

    if (!newUser.username.trim() || !newUser.email.trim() || !newUser.password || !newUser.fullName.trim()) {
      setCreateUserError('All marked user profile fields are mandatory.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const created = await authApi.createUserByAdmin(newUser);
      setCreateUserSuccess(`User @${created.username} created successfully with role ${created.role}.`);
      setNewUser({
        username: '',
        email: '',
        password: '',
        fullName: '',
        department: '',
        role: 'ROLE_TECHNICIAN'
      });
      fetchUsers();
      setTimeout(() => {
        setIsCreateUserOpen(false);
        setCreateUserSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'User creation failed';
      setCreateUserError(msg);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return { bg: 'rgba(255, 65, 108, 0.15)', color: '#ff9a8b', border: 'rgba(255, 65, 108, 0.4)' };
      case 'ROLE_TECHNICIAN':
        return { bg: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', border: 'rgba(0, 242, 254, 0.4)' };
      case 'ROLE_EMPLOYEE': default:
        return { bg: 'rgba(96, 239, 160, 0.15)', color: '#60efa0', border: 'rgba(96, 239, 160, 0.4)' };
    }
  };

  return (
    <div 
      style={{
        backgroundColor: '#000000',
        minHeight: 'calc(100vh - 76px)',
        color: '#ffffff',
        padding: '36px 36px 64px 36px',
        maxWidth: '1440px',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        <div>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#ff416c',
              backgroundColor: 'rgba(255, 65, 108, 0.1)',
              padding: '4px 10px',
              borderRadius: '9999px',
              letterSpacing: '0.12em',
              marginBottom: '10px'
            }}
          >
            <span>●</span> EXECUTIVE IT COMMAND &amp; GOVERNANCE
          </div>
          <h1 
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0'
            }}
          >
            Administrator Command Center
          </h1>
          <p 
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#94a3b8',
              margin: 0
            }}
          >
            Logged in as <strong style={{ color: '#ffffff' }}>@{user?.username}</strong> ({user?.fullName || 'Root Administrator'}). Full access to global incident state machines, RBAC identity directory, and SLA metrics.
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'USERS' && (
          <button
            onClick={() => setIsCreateUserOpen(true)}
            className="btn-pill btn-pill-amber-pink"
            style={{ padding: '12px 24px', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>+ Provision System User</span>
          </button>
        )}
      </div>

      {/* Primary Tab Navigation */}
      <div 
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '16px',
          marginBottom: '32px'
        }}
      >
        <button
          onClick={() => setActiveTab('INCIDENTS')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'INCIDENTS' ? '#38bdf8' : '#94a3b8',
            fontFamily: 'var(--font-display)',
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 12px',
            position: 'relative'
          }}
        >
          <span>Global Incident Oversight</span>
          {activeTab === 'INCIDENTS' && (
            <div style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', backgroundColor: '#38bdf8' }} />
          )}
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'USERS' ? '#38bdf8' : '#94a3b8',
            fontFamily: 'var(--font-display)',
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 12px',
            position: 'relative'
          }}
        >
          <span>User Directory &amp; RBAC Governance</span>
          {activeTab === 'USERS' && (
            <div style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', backgroundColor: '#38bdf8' }} />
          )}
        </button>

        <button
          onClick={() => setActiveTab('TELEMETRY')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'TELEMETRY' ? '#38bdf8' : '#94a3b8',
            fontFamily: 'var(--font-display)',
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 12px',
            position: 'relative'
          }}
        >
          <span>Platform SLA &amp; Telemetry</span>
          {activeTab === 'TELEMETRY' && (
            <div style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', backgroundColor: '#38bdf8' }} />
          )}
        </button>
      </div>

      {/* TAB 1: Global Incidents Oversight */}
      {activeTab === 'INCIDENTS' && (
        <div>
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Showing {incidents.length} system-wide registered incidents with administrative override permissions.
            </div>
            <button
              onClick={fetchAllIncidents}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Reload All
            </button>
          </div>

          {isLoadingIncidents ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              Loading global incident registry...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {incidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(16px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(26, 38, 66, 0.75)';
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 360px' }}>
                    <span 
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '8px'
                      }}
                    >
                      {inc.ticketNumber}
                    </span>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: '#ffffff', margin: '0 0 4px 0' }}>
                        {inc.title}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '10px' }}>
                        <span>Reporter: <strong style={{ color: '#cbd5e1' }}>{inc.reporter?.username}</strong></span>
                        <span>•</span>
                        <span>Assignee: <strong style={{ color: inc.assignee ? '#38bdf8' : '#f59e0b' }}>{inc.assignee?.username || 'Unassigned'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0' }}>
                      {inc.priority}
                    </span>
                    <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '3px 12px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      {inc.status}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: User Directory & RBAC Governance */}
      {activeTab === 'USERS' && (
        <div>
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#ffffff', margin: '0 0 4px 0' }}>
                Corporate Directory &amp; RBAC Roles
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Directly bound to backend <code style={{ color: '#38bdf8' }}>GET /api/v1/users</code> with role authorization enforcement.
              </p>
            </div>
            <button
              onClick={fetchUsers}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Refresh Directory
            </button>
          </div>

          {userError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>
              {userError}
            </div>
          )}

          {isLoadingUsers ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              Fetching user directory from Spring Boot backend...
            </div>
          ) : (
            <div 
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(2, 6, 23, 0.6)' }}>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'var(--font-display)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ID &amp; User</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'var(--font-display)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'var(--font-display)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Department</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'var(--font-display)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assigned RBAC Role</th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'var(--font-display)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const roleBadge = getRoleBadgeStyle(u.role);
                    return (
                      <tr 
                        key={u.id}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div 
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#ffffff'
                              }}
                            >
                              {u.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13.5px' }}>{u.fullName || u.username}</div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#cbd5e1' }}>{u.email}</td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{u.department || 'General Staff'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span 
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-display)',
                              fontWeight: 700,
                              backgroundColor: roleBadge.bg,
                              color: roleBadge.color,
                              border: `1px solid ${roleBadge.border}`,
                              padding: '3px 10px',
                              borderRadius: '9999px'
                            }}
                          >
                            {u.role || 'ROLE_EMPLOYEE'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: u.isActive ? '#00ff87' : '#94a3b8' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: u.isActive ? '#00ff87' : '#94a3b8' }} />
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Platform Telemetry & External Dependencies */}
      {activeTab === 'TELEMETRY' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Health & SLA Policies */}
          <div 
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff87', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
              <span>●</span> LIVE SYSTEM TELEMETRY
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#ffffff', margin: '0 0 16px 0' }}>
              Operational SLA Parameters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 77, 79, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', color: '#ff4d4f' }}>
                  <span>P1 // Critical Incident SLA</span>
                  <span>1h Response • 4h Resolution</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Service outage or critical business interruption</div>
              </div>

              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(250, 140, 22, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', color: '#fa8c16' }}>
                  <span>P2 // High Priority SLA</span>
                  <span>2h Response • 8h Resolution</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Major feature failure or operational degradation</div>
              </div>

              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(24, 144, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', color: '#1890ff' }}>
                  <span>P3 // Medium Priority SLA</span>
                  <span>4h Response • 24h Resolution</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Non-critical service impairment or operational defect</div>
              </div>

              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(82, 196, 26, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', color: '#52c41a' }}>
                  <span>P4 // Low Priority SLA</span>
                  <span>8h Response • 48h Resolution</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Minor defect, routine inquiry, or hardware provisioning</div>
              </div>
            </div>
          </div>

          {/* Backend API Dependency Disclosure */}
          <div 
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
              <span>●</span> ARCHITECTURE &amp; DEPENDENCY REPORT
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#ffffff', margin: '0 0 14px 0' }}>
              Backend Integration Status
            </h3>

            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#00ff87' }}>✓</span>
                <div>
                  <strong style={{ color: '#ffffff' }}>POST /api/v1/auth/login:</strong> Live integration; authenticates credentials, returns JWT token &amp; user details.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#00ff87' }}>✓</span>
                <div>
                  <strong style={{ color: '#ffffff' }}>GET /api/v1/users/me:</strong> Live integration; verifies JWT identity on load and enforces RBAC session.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#00ff87' }}>✓</span>
                <div>
                  <strong style={{ color: '#ffffff' }}>GET /api/v1/users &amp; POST /api/v1/users/admin:</strong> Live integration; lists directory and provisions new users with roles.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#00ff87' }}>✓</span>
                <div>
                  <strong style={{ color: '#ffffff' }}>GET &amp; POST /api/v1/incidents:</strong> Live integration; creates, paginates, filters, and assigns incidents.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '6px' }}>
                <span style={{ color: '#f59e0b' }}>⚠️</span>
                <div>
                  <strong style={{ color: '#fef08a' }}>Upcoming Dependency:</strong> Standalone SLA Policy CRUD endpoints (`/api/v1/sla-policies`) and Kafka event stream endpoints are scheduled for subsequent phases. Currently SLA policies are validated via database relations.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {isCreateUserOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#ffffff', margin: '0 0 8px 0' }}>
              Provision New System User
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Admin endpoint: <code style={{ color: '#38bdf8' }}>POST /api/v1/users/admin</code>. User will be created with BCrypt password hashing.
            </p>

            {createUserError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '10px', color: '#fca5a5', fontSize: '12px', marginBottom: '16px' }}>
                {createUserError}
              </div>
            )}

            {createUserSuccess && (
              <div style={{ backgroundColor: 'rgba(0, 255, 135, 0.12)', border: '1px solid rgba(0, 255, 135, 0.3)', borderRadius: '10px', padding: '10px', color: '#00ff87', fontSize: '12px', marginBottom: '16px' }}>
                {createUserSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>Username *</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="e.g. tech.alex"
                    style={{ width: '100%', backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="alex@resolv.internal"
                    style={{ width: '100%', backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Alex Rivera"
                    style={{ width: '100%', backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Cloud Infrastructure"
                    style={{ width: '100%', backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Min 8 chars"
                    style={{ width: '100%', backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>RBAC Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    style={{ width: '100%', backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="ROLE_TECHNICIAN">ROLE_TECHNICIAN (IT Support)</option>
                    <option value="ROLE_EMPLOYEE">ROLE_EMPLOYEE (End User)</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN (Full Governance)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#94a3b8', borderRadius: '9999px', padding: '9px 18px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="btn-pill btn-pill-amber-pink"
                  style={{ padding: '9px 24px', fontSize: '13px', fontWeight: 700 }}
                >
                  {isCreatingUser ? 'Creating User...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdated={fetchAllIncidents}
      />
    </div>
  );
};
