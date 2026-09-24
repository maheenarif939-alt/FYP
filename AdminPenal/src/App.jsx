import React, { useState, useEffect } from 'react';
import {
  Mail, Lock, ArrowRight, LogOut, Users, Activity,
  Image as ImageIcon, Eye, EyeOff, Plus, Power, X, Stethoscope, Wallet,
  ScanLine, ClipboardList, LayoutGrid, UserRound, Trash2, Brain
} from 'lucide-react';
import {
  MEDIA_URL, adminLogin, fetchStats, fetchModeration, fetchPayments,
  fetchDoctors, fetchPatients, fetchAllCases, fetchAiAnalysis,
  approvePayment, moderationAction, toggleDoctor, deleteDoctor, addDoctor,
} from './api';

const CHART_SHADES = ['#0E6B57', '#1F8A70', '#3EA88C', '#6FC1AA', '#A3D9C7', '#D3EEE4'];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'moderation', label: 'Scan review', icon: ScanLine },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'patients', label: 'Patients', icon: UserRound },
  { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
  { id: 'cases', label: 'All cases', icon: ClipboardList },
];

export default function App() {
  //  Auth state 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  //  Navigation 
  const [activePage, setActivePage] = useState('overview');

  // Dashboard data 
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

  //  Add doctor modal 
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ full_name: '', email: '', password: '', specialty: '' });
  const [addDoctorError, setAddDoctorError] = useState('');

  useEffect(() => {
    if (isLoggedIn) loadAllData();
  }, [isLoggedIn]);

  //  Data loading 
  const loadAllData = () => {
    fetchStats().then((d) => setStats(d.stats)).catch((e) => console.log('Stats:', e.message));
    fetchModeration().then((d) => setModerationCases(d.cases)).catch((e) => console.log('Moderation:', e.message));
    fetchPayments().then((d) => setPayments(d.payments)).catch((e) => console.log('Payments:', e.message));
    fetchDoctors().then((d) => setDoctors(d.doctors)).catch((e) => console.log('Doctors:', e.message));
    fetchPatients().then((d) => setPatients(d.patients)).catch((e) => console.log('Patients:', e.message));
    fetchAllCases().then((d) => setAllCases(d.cases)).catch((e) => console.log('Cases:', e.message));
    fetchAiAnalysis().then((d) => setAiCases(d.cases)).catch((e) => console.log('AI analysis:', e.message));
  };

  //  Handlers 
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await adminLogin(email, password);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleApprovePayment = async (paymentId, caseId) => {
    try {
      await approvePayment(paymentId, caseId);
      loadAllData();
    } catch (err) {
      alert('The payment could not be processed.');
    }
  };

  const handleImageAction = async (caseId, action) => {
    try {
      await moderationAction(caseId, action);
      loadAllData();
    } catch (err) {
      alert('The action could not be performed.');
    }
  };

  const handleToggleDoctor = async (docEmail) => {
    try {
      await toggleDoctor(docEmail);
      fetchDoctors().then((d) => setDoctors(d.doctors));
    } catch (err) {
      alert('The status could not be changed.');
    }
  };

  const handleDeleteDoctor = async (docEmail) => {
    if (!window.confirm('Are you sure you want to permanently delete this doctor account?')) return;
    try {
      await deleteDoctor(docEmail);
      loadAllData();
    } catch (err) {
      alert('Doctor could not be deleted.');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddDoctorError('');
    try {
      await addDoctor(newDoctor);
      setShowAddDoctor(false);
      setNewDoctor({ full_name: '', email: '', password: '', specialty: '' });
      loadAllData();
    } catch (err) {
      setAddDoctorError(err.message);
    }
  };

  //  Login screen 
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent w-full outline-none text-[#1B211D] text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#5C6B62]">
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

  //  Derived values 
  const pendingModerationCount = moderationCases.filter((c) => c.image_status === 'Pending Review').length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'Pending Verification').length;
  const navWithCounts = NAV_ITEMS.map((item) => ({
    ...item,
    count: item.id === 'moderation' ? pendingModerationCount : item.id === 'payments' ? pendingPaymentsCount : 0,
  }));
  const pageTitle = navWithCounts.find((n) => n.id === activePage)?.label || '';
  const totalDiseaseCount = stats.disease_breakdown.reduce((s, x) => s + x.count, 0);

  //  Dashboard 
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
          {navWithCounts.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
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
            onClick={() => setIsLoggedIn(false)}
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
                      {stats.disease_breakdown.map((d, i) => {
                        const pct = totalDiseaseCount > 0 ? (d.count / totalDiseaseCount) * 100 : 0;
                        return (
                          <div key={d.disease} style={{ width: pct + '%', backgroundColor: CHART_SHADES[i % CHART_SHADES.length] }} />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {stats.disease_breakdown.map((d, i) => (
                        <div key={d.disease} className="flex items-center gap-2 text-sm">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_SHADES[i % CHART_SHADES.length] }} />
                          <span className="text-[#1B211D]">{d.disease}</span>
                          <span className="font-mono text-[#5C6B62]">{d.count}</span>
                        </div>
                      ))}
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
                  {moderationCases.map((item) => (
                    <div key={item.case_id} className="bg-white p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <img
                        src={item.scan_image ? MEDIA_URL + item.scan_image : ''}
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
                            onClick={() => handleImageAction(item.case_id, 'Clear')}
                            className="bg-[#0E6B57] hover:bg-[#0B5747] text-white px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Approve &amp; send
                          </button>
                          <button
                            onClick={() => handleImageAction(item.case_id, 'Retake Requested')}
                            className="border border-[#A23B2E] text-[#A23B2E] hover:bg-[#F7E9E7] px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Request retake
                          </button>
                        </div>
                      ) : (
                        <Badge tone="neutral">{item.image_status}</Badge>
                      )}
                    </div>
                  ))}
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
                  rows={payments.map((p) => [
                    <div key="patient">
                      <p className="font-medium">{p.user_name}</p>
                      <p className="text-xs font-mono text-[#5C6B62]">{p.case_id}</p>
                    </div>,
                    <span key="txn" className="font-mono text-sm">{p.transaction_id}</span>,
                    <span key="amt" className="font-mono text-sm">Rs. {p.amount}</span>,
                    <a key="ss" href={p.screenshot ? MEDIA_URL + p.screenshot : '#'} target="_blank" rel="noreferrer" className="text-[#0E6B57] text-sm font-medium underline underline-offset-2 flex items-center gap-1">
                      <ImageIcon size={14} /> View
                    </a>,
                    <Badge key="status" tone={p.status === 'Approved' ? 'success' : 'pending'}>{p.status}</Badge>,
                    p.status === 'Pending Verification' ? (
                      <button
                        key="action"
                        onClick={() => handleApprovePayment(p.payment_id, p.case_id)}
                        className="bg-[#0E6B57] hover:bg-[#0B5747] text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
                      >
                        Approve
                      </button>
                    ) : <span key="action" className="text-[#0E6B57] text-sm font-medium">Confirmed</span>,
                  ])}
                />
              )}
            </div>
          )}

          {activePage === 'doctors' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#5C6B62]">Manage which dermatologists can sign in and review cases.</p>
                <button
                  onClick={() => setShowAddDoctor(true)}
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
                  rows={doctors.map((d) => [
                    <span key="name" className="font-medium">{d.name}</span>,
                    <span key="email" className="text-sm text-[#5C6B62]">{d.email}</span>,
                    <span key="spec" className="text-sm">{d.specialty}</span>,
                    <Badge key="status" tone={d.status === 'Active' ? 'success' : 'neutral'}>{d.status}</Badge>,
                    <div key="actions" className="flex gap-2">
                      <button
                        onClick={() => handleToggleDoctor(d.email)}
                        className={'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' + (d.status === 'Active' ? 'border border-[#A23B2E] text-[#A23B2E] hover:bg-[#F7E9E7]' : 'bg-[#0E6B57] hover:bg-[#0B5747] text-white')}
                      >
                        <Power size={14} /> {d.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(d.email)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-[#A23B2E] text-[#A23B2E] hover:bg-[#F7E9E7] transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>,
                  ])}
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
                  rows={patients.map((p) => [
                    <span key="name" className="font-medium">{p.name}</span>,
                    <span key="email" className="text-sm text-[#5C6B62]">{p.email}</span>,
                    <span key="age" className="text-sm font-mono">{p.age != null ? p.age : '-'}</span>,
                    <span key="scans" className="text-sm font-mono">{p.total_scans}</span>,
                  ])}
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
                  rows={aiCases.map((c) => [
                    <span key="patient" className="font-medium">{c.user_name}</span>,
                    <span key="id" className="font-mono text-sm">{c.case_number}</span>,
                    <span key="detected" className="text-sm text-[#0E6B57] font-medium">{c.disease_detected}</span>,
                    <span key="conf" className="font-mono text-sm">{Math.round((c.confidence || 0) * 100)}%</span>,
                    <Badge key="status" tone={c.status === 'approved' ? 'success' : 'pending'}>{c.status}</Badge>,
                    <button
                      key="view"
                      onClick={() => setSelectedAiCase(c)}
                      className="text-[#0E6B57] text-sm font-medium underline underline-offset-2"
                    >
                      View
                    </button>,
                  ])}
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
                  rows={allCases.map((c) => [
                    <span key="id" className="font-mono text-sm">{c.id}</span>,
                    <span key="name" className="text-sm">{c.name}</span>,
                    <span key="issue" className="text-sm text-[#0E6B57] font-medium">{c.issue}</span>,
                    <Badge key="status" tone={c.status === 'approved' ? 'success' : 'pending'}>{c.status}</Badge>,
                    <span key="date" className="text-xs text-[#5C6B62]">{c.date ? new Date(c.date).toLocaleDateString() : '-'}</span>,
                  ])}
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
              <button onClick={() => setShowAddDoctor(false)} className="text-[#5C6B62]"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-3.5">
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Full name</label>
                <input
                  type="text" required value={newDoctor.full_name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, full_name: e.target.value })}
                  className="w-full border border-[#DDE1DA] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0E6B57]"
                  placeholder="Dr. Ayesha Malik"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Email</label>
                <input
                  type="email" required value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  className="w-full border border-[#DDE1DA] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0E6B57]"
                  placeholder="doctor@dermacare.com"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Temporary password</label>
                <input
                  type="text" required value={newDoctor.password}
                  onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                  className="w-full border border-[#DDE1DA] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0E6B57]"
                  placeholder="Doctor will use this to sign in"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C6B62] mb-1.5">Specialty</label>
                <input
                  type="text" value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
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
              <button onClick={() => setSelectedAiCase(null)} className="text-[#5C6B62]"><X size={18} /></button>
            </div>

            {selectedAiCase.scan_image && (
              <img
                src={MEDIA_URL + selectedAiCase.scan_image}
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

// reusable UI 

function StatTile({ label, value, icon: Icon }) {
  return (
    <div className="bg-white p-5">
      <div className="flex items-center gap-2 text-[#5C6B62] mb-2">
        <Icon size={15} />
        <p className="text-sm">{label}</p>
      </div>
      <p className="text-2xl font-semibold font-mono">{value}</p>
    </div>
  );
}

function Badge({ tone, children }) {
  const tones = {
    success: 'bg-[#E4F2EE] text-[#0E6B57]',
    pending: 'bg-[#FBF1DF] text-[#B4791C]',
    neutral: 'bg-[#F0F1EE] text-[#5C6B62]',
  };
  return (
    <span className={'inline-block px-2.5 py-1 rounded-full text-xs font-medium ' + (tones[tone] || tones.neutral)}>
      {children}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="border border-dashed border-[#DDE1DA] rounded-lg py-16 text-center">
      <p className="text-sm text-[#5C6B62]">{text}</p>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="bg-white border border-[#DDE1DA] rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#DDE1DA]">
            {headers.map((h, i) => (
              <th key={i} className="text-sm font-medium text-[#5C6B62] px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i !== rows.length - 1 ? 'border-b border-[#F0F1EE]' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-3.5">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}