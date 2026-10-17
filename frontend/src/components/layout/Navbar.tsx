import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MegaDropdown } from './MegaDropdown';

interface NavbarProps {
  onOpenCreateIncident?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  systemHealthStatus?: string;
  activeQueueCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateIncident,
  onNavigateSection,
  systemHealthStatus = 'ALL SYSTEMS OPERATIONAL (99.8%)',
  activeQueueCount = 48
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(() => typeof window !== 'undefined' && window.location.search.includes('menu=open'));
  const [activeNav, setActiveNav] = useState<string>('portfolios');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  const handleNavClick = (sectionId: string, navKey: string) => {
    setActiveNav(navKey);
    if (isHomePage && onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const getWorkspacePath = () => {
    if (!user) return '/login';
    if (user.role === 'ROLE_ADMIN') return '/workspace/admin';
    if (user.role === 'ROLE_TECHNICIAN') return '/workspace/technician';
    return '/workspace/employee';
  };

  const getWorkspaceLabel = () => {
    if (!user) return 'Workspace';
    if (user.role === 'ROLE_ADMIN') return 'Admin Console';
    if (user.role === 'ROLE_TECHNICIAN') return 'Tech Workbench';
    return 'My Tickets';
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ROLE_ADMIN') return { label: 'ADMIN', color: '#ff416c', bg: 'rgba(255, 65, 108, 0.15)' };
    if (user.role === 'ROLE_TECHNICIAN') return { label: 'TECH', color: '#00f2fe', bg: 'rgba(0, 242, 254, 0.15)' };
    return { label: 'STAFF', color: '#60efa0', bg: 'rgba(96, 239, 160, 0.15)' };
  };

  const roleBadge = getRoleBadge();

  return (
    <header 
      id="main-app-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        height: '76px',
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Brand & Wordmark (Strict replication of team COMPUTERS layout from frame_000s) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link 
          to="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}
        >
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7A0026 0%, #3D003E 60%, #1582C5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              boxShadow: '0 4px 16px rgba(122, 0, 38, 0.5)'
            }}
          >
            R
          </div>
          <div>
            <div 
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '20px',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.0,
                textTransform: 'lowercase'
              }}
            >
              resolv
            </div>
            <div 
              style={{
                fontSize: '8.5px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: '#94a3b8',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginTop: '3px'
              }}
            >
              SERVICE DESK
            </div>
          </div>
        </Link>

        {/* Center Nav Links strictly replicating Team Computers header styling */}
        <nav className="navbar-nav">
          {/* Mega Menu Trigger: "What We Do ▾" / "Incident Portfolios ▾" */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsMegaMenuOpen(true)}
          >
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isMegaMenuOpen ? '#38bdf8' : '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '6px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              <span>Incident Portfolios</span>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  transform: isMegaMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Clean Text Nav Links matching frame_000s */}
          <button
            onClick={() => handleNavClick('domains', 'ops')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeNav === 'ops' ? '#38bdf8' : '#ffffff',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              padding: '6px 0',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              borderBottom: activeNav === 'ops' ? '2px solid #38bdf8' : '2px solid transparent'
            }}
          >
            Operations Desk
          </button>

          <Link
            to="/incidents"
            style={{
              textDecoration: 'none',
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s ease'
            }}
          >
            <span>All Incidents</span>
            <span 
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: '#0284c7',
                color: '#ffffff',
                padding: '1px 7px',
                borderRadius: '9999px'
              }}
            >
              {activeQueueCount}
            </span>
          </Link>

          <button
            onClick={() => handleNavClick('runbooks-carousel', 'insights')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeNav === 'insights' ? '#38bdf8' : '#ffffff',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              padding: '6px 0',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              borderBottom: activeNav === 'insights' ? '2px solid #38bdf8' : '2px solid transparent'
            }}
          >
            Insights &amp; Runbooks
          </button>

          <button
            onClick={() => handleNavClick('zero-incident', 'zero')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeNav === 'zero' ? '#00ff87' : '#ffffff',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              padding: '6px 0',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              borderBottom: activeNav === 'zero' ? '2px solid #00ff87' : '2px solid transparent'
            }}
          >
            Zero Incident SLA
          </button>

          {/* Dynamic Protected Role Workspace Link */}
          {isAuthenticated && (
            <Link
              to={getWorkspacePath()}
              style={{
                textDecoration: 'none',
                color: '#38bdf8',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{getWorkspaceLabel()}</span>
              <span>→</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Right Action Hub */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live Systems Monitoring Pill */}
        <div className="nav-monitoring-pill">
          <span className="live-pulse-dot"></span>
          <span>{systemHealthStatus}</span>
        </div>

        {/* New Incident Pill CTA */}
        {onOpenCreateIncident && (
          <button
            onClick={onOpenCreateIncident}
            className="btn-pill btn-pill-amber-pink"
            id="btn-navbar-create-incident"
            style={{ fontSize: '13px', padding: '8px 20px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Log Incident</span>
          </button>
        )}

        {/* User Authentication Pill / Menu */}
        {isAuthenticated && user ? (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '4px 8px 4px 4px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
            >
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '12px',
                  color: '#ffffff'
                }}
              >
                {user.username.slice(0, 2).toUpperCase()}
              </div>

              {roleBadge && (
                <span 
                  style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: roleBadge.color,
                    backgroundColor: roleBadge.bg,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {roleBadge.label}
                </span>
              )}

              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Floating Profile Dropdown */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  width: '240px',
                  padding: '16px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                  zIndex: 100,
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13.5px' }}>{user.fullName || user.username}</div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>@{user.username}</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px' }}>{user.role}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Link
                    to={getWorkspacePath()}
                    onClick={() => setIsProfileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    Open Workspace
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '13px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Sign In Pill Button */
          <Link
            to="/login"
            style={{
              textDecoration: 'none',
              padding: '8px 20px',
              fontSize: '13px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Floating Mega Dropdown Menu */}
      <MegaDropdown 
        isOpen={isMegaMenuOpen} 
        onClose={() => setIsMegaMenuOpen(false)}
        onSelectAction={(_actionTitle) => {
          handleNavClick('triage-table', 'queue');
        }}
      />
    </header>
  );
};
