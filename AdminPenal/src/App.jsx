import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Mail, Lock, ArrowRight, LogOut, Users, Activity, Clock,
  Image as ImageIcon, Eye, EyeOff, Plus, Power, X, Stethoscope, Wallet,
  ScanLine, ClipboardList, LayoutGrid, UserRound, Trash2, Brain
} from 'lucide-react';
import { BASE_URL } from './config';

// Disease breakdown bar shades 
const CHART_SHADES = ['#0E6B57', '#1F8A70', '#3EA88C', '#6FC1AA', '#A3D9C7', '#D3EEE4'];

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activePage, setActivePage] = useState('overview');

  const [stats, setStats] = useState({
    total_ai_scans: 0, total_patients: 0,
    total_doctors: 0, total_revenue: 0, pending_actions: 0, disease_breakdown: [],
  });
  const [moderationCases, setModerationCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [aiCases, setAiCases] = useState([]);
  const [selectedAiCase, setSelectedAiCase] = useState(null);

  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ full_name: '', email: '', password: '', specialty: '' });
  const [addDoctorError, setAddDoctorError] = useState('');

  useEffect(() => {
    if (isLoggedIn) loadAllData();
  }, [isLoggedIn]);

  const loadAllData = () => {
    fetchStats();
    fetchModeration();
    fetchPayments();
    fetchDoctors();
    fetchPatients();
    fetchAllCases();
    fetchAiAnalysis();
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(BASE_URL + '/admin/stats/');
      const data = await res.json();
      if (res.ok) setStats(data.stats);
    } catch (err) { console.log('Stats load error:', err); }
  };

  const fetchModeration = async () => {
    try {
      const res = await fetch(BASE_URL + '/admin/moderation/');
      const data = await res.json();
      if (res.ok) setModerationCases(data.cases);
    } catch (err) { console.log('Moderation load error:', err); }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(BASE_URL + '/admin/payments/');
      const data = await res.json();
      if (res.ok) setPayments(data.payments);
    } catch (err) { console.log('Payments load error:', err); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(BASE_URL + '/admin/doctors/');
      const data = await res.json();
      if (res.ok) setDoctors(data.doctors);
    } catch (err) { console.log('Doctors load error:', err); }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(BASE_URL + '/admin/patients/');
      const data = await res.json();
      if (res.ok) setPatients(data.patients);
    } catch (err) { console.log('Patients load error:', err); }
  };

  const fetchAllCases = async () => {
    try {
      const res = await fetch(BASE_URL + '/all-cases/');
      const data = await res.json();
      if (res.ok) setAllCases(data.cases);
    } catch (err) { console.log('Cases load error:', err); }
  };

  const fetchAiAnalysis = async () => {
    try {
      const res = await fetch(BASE_URL + '/admin/ai-analysis/');
      const data = await res.json();
      if (res.ok) setAiCases(data.cases);
    } catch (err) { console.log('AI analysis load error:', err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch(BASE_URL + '/admin-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await res.json();
      setLoggingIn(false);
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoggingIn(false);
      setLoginError('Server se connect nahi ho saka. Backend chal raha hai?');
    }
  };

  const handleApprovePayment = async (paymentId, caseId) => {
    try {
      await fetch(BASE_URL + '/admin/payments/approve/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, case_id: caseId }),
      });
      fetchPayments();
      fetchStats();
    } catch (err) { alert('Payment approve nahi ho saka.'); }
  };

  const handleImageAction = async (caseId, action) => {
    try {
      await fetch(BASE_URL + '/admin/moderation/action/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, action: action }),
      });
      fetchModeration();
      fetchStats();
    } catch (err) { alert('Action perform nahi ho saka.'); }
  };

  const handleToggleDoctor = async (docEmail) => {
    try {
      await fetch(BASE_URL + '/admin/doctors/toggle/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: docEmail }),
      });
      fetchDoctors();
    } catch (err) { alert('Status change nahi ho saka.'); }
  };

  const handleDeleteDoctor = async (docEmail) => {
    if (!window.confirm('Are you sure you want to permanently delete this doctor account?')) return;
    try {
      await fetch(BASE_URL + '/admin/doctors/delete/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: docEmail }),
      });
      fetchDoctors();
      fetchStats();
    } catch (err) {
      alert('Doctor could not be deleted.');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddDoctorError('');
    try {
      const res = await fetch(BASE_URL + '/admin/doctors/add/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddDoctor(false);
        setNewDoctor({ full_name: '', email: '', password: '', specialty: '' });
        fetchDoctors();
        fetchStats();
      } else {
        setAddDoctorError(data.error || 'Doctor add nahi ho saka.');
      }
    } catch (err) {
      setAddDoctorError('Server se connect nahi ho saka.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F1] p-6" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div className="w-full max-w-sm">
          <div className="bg-white border border-[#DDE1DA] rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-md bg-[#0E6B57] flex items-center justify-center text-white mb-4">
                <ScanLine size={22} />
              </div>
              <h1 className="text-xl font-semibold text-[#1B211D]">DermaCareMe Admin</h1>
              <p className="text-sm text-[#5C6B62] mt-1">Sign in to access the console</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Email</label>
                <div className="flex items-center bg-white border border-[#DDE1DA] rounded-md px-3.5 py-2.5 focus-within:border-[#0E6B57] transition-colors">
                  <Mail size={17} className="text-[#5C6B62] mr-2.5 shrink-0" />
                  <input
                    type="email"
                    placeholder="admin@dermacare.com"
                    value={email}
                    onChange={function (e) { setEmail(e.target.value); }}
                    className="bg-transparent w-full outline-none text-[#1B211D] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Password</label>
                <div className="flex items-center bg-white border border-[#DDE1DA] rounded-md px-3.5 py-2.5 focus-within:border-[#0E6B57] transition-colors">
                  <Lock size={17} className="text-[#5C6B62] mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={function (e) { setPassword(e.target.value); }}
                    className="bg-transparent w-full outline-none text-[#1B211D] text-sm"
                  />
                  <button type="button" onClick={function () { setShowPassword(!showPassword); }} className="text-[#5C6B62]">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {loginError && <p className="text-[#A23B2E] text-sm">{loginError}</p>}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full h-11 rounded-md bg-[#0E6B57] hover:bg-[#0B5747] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loggingIn ? 'Signing in...' : 'Sign in'}
                {!loggingIn && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const pendingModerationCount = moderationCases.filter(function (c) { return c.image_status === 'Pending Review'; }).length;
  const pendingPaymentsCount = payments.filter(function (p) { return p.status === 'Pending Verification'; }).length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'moderation', label: 'Scan review', icon: ScanLine, count: pendingModerationCount },
    { id: 'payments', label: 'Payments', icon: Wallet, count: pendingPaymentsCount },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'patients', label: 'Patients', icon: UserRound },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
    { id: 'cases', label: 'All cases', icon: ClipboardList },
  ];

  let pageTitle = '';
  for (let i = 0; i < navItems.length; i++) {
    if (navItems[i].id === activePage) pageTitle = navItems[i].label;
  }

  const totalDiseaseCount = stats.disease_breakdown.reduce(function (s, x) { return s + x.count; }, 0);

  return (
    <div className="min-h-screen flex bg-[#F4F5F1] text-[#1B211D]" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>

      <aside className="w-60 shrink-0 bg-[#1B211D] text-[#F4F5F1] flex flex-col">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-md bg-[#0E6B57] flex items-center justify-center">
            <ScanLine size={17} />
          </div>
          <span className="text-sm font-semibold tracking-tight">DermaCareMe</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(function (item) {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={function () { setActivePage(item.id); }}
                className={'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors border-l-2 ' + (active ? 'bg-white/10 border-[#3EA88C] text-white font-medium' : 'border-transparent text-[#9AA69E] hover:bg-white/5 hover:text-white')}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={17} />
                  {item.label}
                </span>
                {item.count > 0 && (
                  <span className="text-xs font-mono bg-[#B4791C] text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={function () { setIsLoggedIn(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-[#9AA69E] hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-[#DDE1DA] bg-white">
          <h1 className="text-base font-semibold">{pageTitle}</h1>
          <div className="flex items-center gap-2.5 text-sm text-[#5C6B62]">
            <div className="w-7 h-7 rounded-full bg-[#E4F2EE] text-[#0E6B57] flex items-center justify-center text-xs font-semibold">
              A
            </div>
            Admin
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">

          {activePage === 'overview' && (
            <div className="space-y-8 max-w-5xl">
              <div className="bg-white border border-[#DDE1DA] rounded-lg p-8">
                <p className="text-sm text-[#5C6B62] mb-2">Awaiting your action right now</p>
                <p className="text-6xl font-semibold font-mono text-[#1B211D]">{stats.pending_actions}</p>
                <p className="text-sm text-[#5C6B62] mt-2">
                  Pending payment verifications and scan-quality reviews combined.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#DDE1DA] border border-[#DDE1DA] rounded-lg overflow-hidden">
                <StatTile label="Total AI scans" value={stats.total_ai_scans} icon={Activity} />
                <StatTile label="Registered patients" value={stats.total_patients} icon={Users} />
                <StatTile label="Active doctors" value={stats.total_doctors} icon={Stethoscope} />
              </div>

              <div className="bg-white border border-[#DDE1DA] rounded-lg p-6">
                <p className="text-sm text-[#5C6B62] mb-1">Revenue collected</p>
                <p className="text-3xl font-semibold font-mono">Rs. {stats.total_revenue.toLocaleString()}</p>
                <p className="text-xs text-[#5C6B62] mt-1">From admin-approved consultation payments.</p>
              </div>

              <div className="bg-white border border-[#DDE1DA] rounded-lg p-6">
                <p className="text-sm text-[#5C6B62] mb-4">Cases by detected condition</p>
                {stats.disease_breakdown.length === 0 ? (
                  <p className="text-sm text-[#5C6B62]">No scans recorded yet.</p>
                ) : (
                  <div>
                    <div className="w-full h-3 rounded-full overflow-hidden flex mb-4">
                      {stats.disease_breakdown.map(function (d, i) {
                        const pct = totalDiseaseCount > 0 ? (d.count / totalDiseaseCount) * 100 : 0;
                        return (
                          <div key={d.disease} style={{ width: pct + '%', backgroundColor: CHART_SHADES[i % CHART_SHADES.length] }} />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {stats.disease_breakdown.map(function (d, i) {
                        return (
                          <div key={d.disease} className="flex items-center gap-2 text-sm">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_SHADES[i % CHART_SHADES.length] }} />
                            <span className="text-[#1B211D]">{d.disease}</span>
                            <span className="font-mono text-[#5C6B62]">{d.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePage === 'moderation' && (
            <div className="max-w-5xl">
              <p className="text-sm text-[#5C6B62] mb-6">Confirm scan image clarity before it reaches a doctor's queue.</p>

              {moderationCases.length === 0 ? (
                <EmptyState text="Nothing waiting on review." />
              ) : (
                <div className="space-y-px bg-[#DDE1DA] border border-[#DDE1DA] rounded-lg overflow-hidden">
                  {moderationCases.map(function (item) {
                    return (
                      <div key={item.case_id} className="bg-white p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <img
                          src={item.scan_image ? BASE_URL + item.scan_image : ''}
                          alt="Scan"
                          className="w-20 h-20 object-cover rounded-md border border-[#DDE1DA] shrink-0"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.user_name}</p>
                          <p className="text-sm text-[#5C6B62]">
                            Detected: <span className="text-[#0E6B57] font-medium">{item.condition}</span>
                            <span className="mx-2">·</span>
                            <span className="font-mono text-xs">{item.case_id}</span>
                          </p>
                        </div>
                        {item.image_status === 'Pending Review' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={function () { handleImageAction(item.case_id, 'Clear'); }}
                              className="bg-[#0E6B57] hover:bg-[#0B5747] text-white px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Approve & send
                            </button>
                            <button
                              onClick={function () { handleImageAction(item.case_id, 'Retake Requested'); }}
                              className="border border-[#A23B2E] text-[#A23B2E] hover:bg-[#F7E9E7] px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Request retake
                            </button>
                          </div>
                        ) : (
                          <Badge tone="neutral">{item.image_status}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activePage === 'payments' && (
            <div className="max-w-5xl">
              <p className="text-sm text-[#5C6B62] mb-6">Verify JazzCash transaction screenshots before a case proceeds to a doctor.</p>

              {payments.length === 0 ? (
                <EmptyState text="No pending payments." />
              ) : (
                <Table
                  headers={['Patient', 'Transaction ID', 'Amount', 'Screenshot', 'Status', '']}
                  rows={payments.map(function (p) {
                    return [
                      <div>
                        <p className="font-medium">{p.user_name}</p>
                        <p className="text-xs font-mono text-[#5C6B62]">{p.case_id}</p>
                      </div>,
                      <span className="font-mono text-sm">{p.transaction_id}</span>,
                      <span className="font-mono text-sm">Rs. {p.amount}</span>,
                      <a href={p.screenshot ? BASE_URL + p.screenshot : '#'} target="_blank" rel="noreferrer" className="text-[#0E6B57] text-sm font-medium underline underline-offset-2 flex items-center gap-1">
                        <ImageIcon size={14} /> View
                      </a>,
                      <Badge tone={p.status === 'Approved' ? 'success' : 'pending'}>{p.status}</Badge>,
                      p.status === 'Pending Verification' ? (
                        <button
                          onClick={function () { handleApprovePayment(p.payment_id, p.case_id); }}
                          className="bg-[#0E6B57] hover:bg-[#0B5747] text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                      ) : <span className="text-[#0E6B57] text-sm font-medium">Confirmed</span>,
                    ];
                  })}
                />
              )}
            </div>
          )}

          {activePage === 'doctors' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#5C6B62]">Manage which dermatologists can sign in and review cases.</p>
                <button
                  onClick={function () { setShowAddDoctor(true); }}
                  className="flex items-center gap-1.5 bg-[#0E6B57] hover:bg-[#0B5747] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> Add doctor
                </button>
              </div>

              {doctors.length === 0 ? (
                <EmptyState text="No doctors added yet." />
              ) : (
                <Table
                  headers={['Name', 'Email', 'Specialty', 'Status', '']}
                  rows={doctors.map(function (d) {
                    return [
                      <span className="font-medium">{d.name}</span>,
                      <span className="text-sm text-[#5C6B62]">{d.email}</span>,
                      <span className="text-sm">{d.specialty}</span>,
                      <Badge tone={d.status === 'Active' ? 'success' : 'neutral'}>{d.status}</Badge>,
                      <div className="flex gap-2">
                        <button
                          onClick={function () { handleToggleDoctor(d.email); }}
                          className={'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' + (d.status === 'Active' ? 'border border-[#A23B2E] text-[#A23B2E] hover:bg-[#F7E9E7]' : 'bg-[#0E6B57] hover:bg-[#0B5747] text-white')}
                        >
                          <Power size={14} /> {d.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={function () { handleDeleteDoctor(d.email); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-[#A23B2E] text-[#A23B2E] hover:bg-[#F7E9E7] transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>,
                    ];
                  })}
                />
              )}
            </div>
          )}

          {activePage === 'patients' && (
            <div className="max-w-5xl">
              <p className="text-sm text-[#5C6B62] mb-6">Everyone registered on the patient app.</p>

              {patients.length === 0 ? (
                <EmptyState text="No patients registered yet." />
              ) : (
                <Table
                  headers={['Name', 'Email', 'Age', 'Total scans']}
                  rows={patients.map(function (p) {
                    return [
                      <span className="font-medium">{p.name}</span>,
                      <span className="text-sm text-[#5C6B62]">{p.email}</span>,
                      <span className="text-sm font-mono">{p.age != null ? p.age : '-'}</span>,
                      <span className="text-sm font-mono">{p.total_scans}</span>,
                    ];
                  })}
                />
              )}
            </div>
          )}

          {activePage === 'ai-analysis' && (
            <div className="max-w-5xl">
              <p className="text-sm text-[#5C6B62] mb-6">
                Every case the AI model has analyzed, regardless of its current stage in the pipeline.
              </p>

              {aiCases.length === 0 ? (
                <EmptyState text="No cases have been analyzed yet." />
              ) : (
                <Table
                  headers={['Patient', 'Case ID', 'Detected', 'Confidence', 'Status', '']}
                  rows={aiCases.map(function (c) {
                    return [
                      <span className="font-medium">{c.user_name}</span>,
                      <span className="font-mono text-sm">{c.case_number}</span>,
                      <span className="text-sm text-[#0E6B57] font-medium">{c.disease_detected}</span>,
                      <span className="font-mono text-sm">{Math.round((c.confidence || 0) * 100)}%</span>,
                      <Badge tone={c.status === 'approved' ? 'success' : 'pending'}>{c.status}</Badge>,
                      <button
                        onClick={function () { setSelectedAiCase(c); }}
                        className="text-[#0E6B57] text-sm font-medium underline underline-offset-2"
                      >
                        View
                      </button>,
                    ];
                  })}
                />
              )}
            </div>
          )}

          {activePage === 'cases' && (
            <div className="max-w-5xl">
              <p className="text-sm text-[#5C6B62] mb-6">Every case submitted through the platform, most recent first.</p>

              {allCases.length === 0 ? (
                <EmptyState text="No cases yet." />
              ) : (
                <Table
                  headers={['Case ID', 'Patient', 'Condition', 'Status', 'Date']}
                  rows={allCases.map(function (c) {
                    return [
                      <span className="font-mono text-sm">{c.id}</span>,
                      <span className="text-sm">{c.name}</span>,
                      <span className="text-sm text-[#0E6B57] font-medium">{c.issue}</span>,
                      <Badge tone={c.status === 'approved' ? 'success' : 'pending'}>{c.status}</Badge>,
                      <span className="text-xs text-[#5C6B62]">{c.date ? new Date(c.date).toLocaleDateString() : '-'}</span>,
                    ];
                  })}
                />
              )}
            </div>
          )}

        </main>
      </div>

      {showAddDoctor && (
        <div className="fixed inset-0 bg-[#1B211D]/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Add a new doctor</h2>
              <button onClick={function () { setShowAddDoctor(false); }} className="text-[#5C6B62]"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-3.5">
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Full name</label>
                <input
                  type="text" required value={newDoctor.full_name}
                  onChange={function (e) { setNewDoctor(Object.assign({}, newDoctor, { full_name: e.target.value })); }}
                  className="w-full border border-[#DDE1DA] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0E6B57]"
                  placeholder="Dr. Ayesha Malik"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Email</label>
                <input
                  type="email" required value={newDoctor.email}
                  onChange={function (e) { setNewDoctor(Object.assign({}, newDoctor, { email: e.target.value })); }}
                  className="w-full border border-[#DDE1DA] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0E6B57]"
                  placeholder="doctor@dermacare.com"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Temporary password</label>
                <input
                  type="text" required value={newDoctor.password}
                  onChange={function (e) { setNewDoctor(Object.assign({}, newDoctor, { password: e.target.value })); }}
                  className="w-full border border-[#DDE1DA] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0E6B57]"
                  placeholder="Doctor will use this to sign in"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Specialty</label>
                <input
                  type="text" value={newDoctor.specialty}
                  onChange={function (e) { setNewDoctor(Object.assign({}, newDoctor, { specialty: e.target.value })); }}
                  className="w-full border border-[#DDE1DA] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0E6B57]"
                  placeholder="e.g. Senior Dermatologist"
                />
              </div>

              {addDoctorError && <p className="text-[#A23B2E] text-sm">{addDoctorError}</p>}

              <button type="submit" className="w-full h-10 rounded-md bg-[#0E6B57] hover:bg-[#0B5747] text-white text-sm font-medium mt-2">
                Create account
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedAiCase && (
        <div className="fixed inset-0 bg-[#1B211D]/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Case {selectedAiCase.case_number}</h2>
              <button onClick={function () { setSelectedAiCase(null); }} className="text-[#5C6B62]"><X size={18} /></button>
            </div>

            {selectedAiCase.scan_image && (
              <img
                src={BASE_URL + selectedAiCase.scan_image}
                alt="Scan"
                className="w-full h-48 object-cover rounded-md border border-[#DDE1DA] mb-4"
              />
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-[#5C6B62]">Patient</span><span className="font-medium">{selectedAiCase.user_name}</span></div>
              <div className="flex justify-between"><span className="text-[#5C6B62]">Detected condition</span><span className="font-medium text-[#0E6B57]">{selectedAiCase.disease_detected}</span></div>
              <div className="flex justify-between"><span className="text-[#5C6B62]">Confidence</span><span className="font-mono">{Math.round((selectedAiCase.confidence || 0) * 100)}%</span></div>
              <div className="flex justify-between"><span className="text-[#5C6B62]">Suggested medicine</span><span className="font-medium">{selectedAiCase.suggested_medicine || '-'}</span></div>
              <div className="flex justify-between items-center"><span className="text-[#5C6B62]">Current status</span><Badge tone={selectedAiCase.status === 'approved' ? 'success' : 'pending'}>{selectedAiCase.status}</Badge></div>
              {selectedAiCase.doctor_note && (
                <div className="pt-2.5 border-t border-[#F0F1EE]">
                  <p className="text-[#5C6B62] mb-1">Doctor's note</p>
                  <p>{selectedAiCase.doctor_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile(props) {
  const Icon = props.icon;
  return (
    <div className="bg-white p-5">
      <div className="flex items-center gap-2 text-[#5C6B62] mb-2">
        <Icon size={15} />
        <p className="text-sm">{props.label}</p>
      </div>
      <p className="text-2xl font-semibold font-mono">{props.value}</p>
    </div>
  );
}

function Badge(props) {
  const tones = {
    success: 'bg-[#E4F2EE] text-[#0E6B57]',
    pending: 'bg-[#FBF1DF] text-[#B4791C]',
    neutral: 'bg-[#F0F1EE] text-[#5C6B62]',
  };
  return (
    <span className={'inline-block px-2.5 py-1 rounded-full text-xs font-medium ' + (tones[props.tone] || tones.neutral)}>
      {props.children}
    </span>
  );
}

function EmptyState(props) {
  return (
    <div className="border border-dashed border-[#DDE1DA] rounded-lg py-16 text-center">
      <p className="text-sm text-[#5C6B62]">{props.text}</p>
    </div>
  );
}

function Table(props) {
  return (
    <div className="bg-white border border-[#DDE1DA] rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#DDE1DA]">
            {props.headers.map(function (h, i) {
              return <th key={i} className="text-sm font-medium text-[#5C6B62] px-5 py-3">{h}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {props.rows.map(function (row, i) {
            return (
              <tr key={i} className={i !== props.rows.length - 1 ? 'border-b border-[#F0F1EE]' : ''}>
                {row.map(function (cell, j) {
                  return <td key={j} className="px-5 py-3.5">{cell}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}