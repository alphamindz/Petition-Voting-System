import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

const RegisterWizardPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  // Wizard Step: 1 = Register, 2 = Verify Email OTP, 3 = Aadhaar eKYC, 4 = Set Password
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    otp: '',
    aadhaarNumber: '',
    referenceId: '',
    aadhaarOtp: '123456',
    password: '',
    confirmPassword: ''
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [devDemoOtp, setDevDemoOtp] = useState('');
  const [testAadhaarList, setTestAadhaarList] = useState([]);
  const [cooldown, setCooldown] = useState(0);

  // Load test Aadhaar numbers for quick sandbox testing
  useEffect(() => {
    const fetchAadhaarList = async () => {
      try {
        const res = await authService.getAadhaarTestIdentities();
        if (res.identities) {
          setTestAadhaarList(res.identities);
        }
      } catch (err) {
        // Non-critical helper
      }
    };
    fetchAadhaarList();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // STEP 1: Submit Registration Details (creates user without password, triggers email OTP)
  const handleStep1Register = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.register(formData.name, formData.email, formData.mobile);
      if (res.devDemoOtp) {
        setDevDemoOtp(res.devDemoOtp);
        setFormData((prev) => ({ ...prev, otp: res.devDemoOtp }));
      }
      setSuccessMsg('Verification code sent to your email! (Check console or preview box)');
      setCooldown(60);
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify 6-digit Email OTP
  const handleStep2VerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.verifyOtp(formData.email, formData.otp);
      setSuccessMsg('Email verified successfully! Proceed to simulated Aadhaar identity check.');
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);

    try {
      const res = await authService.resendOtp(formData.email);
      if (res.devDemoOtp) {
        setDevDemoOtp(res.devDemoOtp);
        setFormData((prev) => ({ ...prev, otp: res.devDemoOtp }));
      }
      setSuccessMsg('New 6-digit code dispatched to your email.');
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3A: Initiate Aadhaar Verification
  const handleInitiateAadhaar = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.initiateAadhaar(formData.email, formData.aadhaarNumber);
      setFormData((prev) => ({
        ...prev,
        referenceId: res.referenceId,
        aadhaarOtp: res.demoOtp || '123456'
      }));
      setSuccessMsg(`Simulated OTP sent to mobile linked with Aadhaar (${res.maskedAadhaar}). Use demo code "123456".`);
    } catch (err) {
      setError(err.response?.data?.message || 'Aadhaar initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3B: Verify Aadhaar OTP
  const handleVerifyAadhaarOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.verifyAadhaar(formData.referenceId, formData.aadhaarOtp);
      setSuccessMsg('Aadhaar identity verified! Create your secure password to complete activation.');
      setCurrentStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Aadhaar OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: Set Strong Password & Complete Registration
  const handleStep4SetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.setPassword(
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      updateUser(res.user);
      navigate('/dashboard', {
        state: { welcomeMessage: '🎉 Welcome to Petition Pulse! Your citizen account is fully verified.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to establish password.');
    } finally {
      setLoading(false);
    }
  };

  // Password rules validation checkers
  const pass = formData.password;
  const hasMinLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[@$!%*?&#^~_]/.test(pass);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Stepper Progress Bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '20px',
                right: '20px',
                height: '3px',
                backgroundColor: 'var(--border)',
                transform: 'translateY(-50%)',
                zIndex: 1
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  width: `${((currentStep - 1) / 3) * 100}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            {[
              { num: 1, label: 'Profile', icon: User },
              { num: 2, label: 'Email OTP', icon: Mail },
              { num: 3, label: 'Aadhaar eKYC', icon: ShieldCheck },
              { num: 4, label: 'Password', icon: Lock }
            ].map((step) => {
              const Icon = step.icon;
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPassed
                        ? 'var(--success)'
                        : isCurrent
                        ? 'var(--primary)'
                        : '#ffffff',
                      color: isPassed || isCurrent ? '#ffffff' : 'var(--text-muted)',
                      border: isPassed || isCurrent ? 'none' : '2px solid var(--border)',
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isPassed ? <CheckCircle size={20} /> : <Icon size={18} />}
                  </div>
                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.4rem',
                      fontSize: '0.78rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}
        {successMsg && <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* ================= STEP 1: INITIAL REGISTRATION ================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Register}>
              <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Create Citizen Account</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  Step 1 of 4: Enter basic contact details to get started.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-subtle)' }} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="priya@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <small style={{ color: 'var(--text-subtle)' }}>We'll send a 6-digit confirmation code here.</small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mobile">Mobile Number *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-subtle)' }} />
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', fontSize: '1rem' }}
              >
                {loading ? 'Sending Verification Code...' : 'Continue to Email Verification'}
                <ArrowRight size={16} />
              </button>

              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Already registered? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
              </p>
            </form>
          )}

          {/* ================= STEP 2: EMAIL OTP VERIFICATION ================= */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2VerifyOtp}>
              <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Verify Your Email</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  Enter the 6-digit code sent to <strong>{formData.email}</strong>.
                </p>
              </div>

              {devDemoOtp && (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    fontSize: '0.88rem',
                    color: '#1e40af'
                  }}
                >
                  <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  <strong>Sandbox Demo Code:</strong> <span style={{ letterSpacing: '2px', fontWeight: 700 }}>{devDemoOtp}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="otp">6-Digit OTP Code</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 700 }}
                    placeholder="123456"
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
                <small style={{ color: 'var(--text-subtle)' }}>Code expires in 10 minutes (maximum 5 attempts allowed).</small>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || loading}
                  style={{ flex: 1, fontSize: '0.88rem' }}
                >
                  <RefreshCw size={15} />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || formData.otp.length < 6}
                  style={{ flex: 1.5 }}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                  <ArrowRight size={16} />
                </button>
              </div>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  ← Edit email address
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3: SIMULATED AADHAAR VERIFICATION ================= */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Simulated Aadhaar Identity eKYC</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Civic verification ensures 1-citizen-1-vote transparency.
                </p>
              </div>

              {/* Developer Test Numbers Helper */}
              {testAadhaarList.length > 0 && !formData.referenceId && (
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    border: '1px solid var(--border)'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Click any sandbox demo Aadhaar to test:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {testAadhaarList.slice(0, 5).map((id) => (
                      <button
                        key={id.fakeAadhaar}
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setFormData((prev) => ({ ...prev, aadhaarNumber: id.fakeAadhaar }))}
                      >
                        {id.fakeAadhaar} ({id.name.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!formData.referenceId ? (
                /* Step 3A: Enter Aadhaar */
                <form onSubmit={handleInitiateAadhaar}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="aadhaarNumber">
                      12-Digit Aadhaar Number (Demo Test Number) *
                    </label>
                    <input
                      type="text"
                      id="aadhaarNumber"
                      name="aadhaarNumber"
                      className="form-input"
                      style={{ letterSpacing: '2px', fontSize: '1.05rem', fontWeight: 600 }}
                      placeholder="999911112222"
                      maxLength={14}
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      required
                    />
                    <small style={{ color: 'var(--text-subtle)', display: 'block', marginTop: '0.35rem' }}>
                      🔒 <strong>Privacy Guarantee:</strong> Raw Aadhaar numbers are never stored in the database.
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !formData.aadhaarNumber}
                    style={{ width: '100%', padding: '0.8rem', marginTop: '0.75rem' }}
                  >
                    {loading ? 'Validating against sandbox...' : 'Send Simulated Aadhaar OTP'}
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                /* Step 3B: Enter Aadhaar OTP */
                <form onSubmit={handleVerifyAadhaarOtp}>
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      fontSize: '0.88rem',
                      color: '#065f46'
                    }}
                  >
                    <Info size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    Reference: <code>{formData.referenceId}</code> | Fixed Demo OTP: <strong>123456</strong>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="aadhaarOtp">Aadhaar Mock OTP</label>
                    <input
                      type="text"
                      id="aadhaarOtp"
                      name="aadhaarOtp"
                      className="form-input"
                      style={{ letterSpacing: '4px', fontSize: '1.15rem', fontWeight: 700 }}
                      placeholder="123456"
                      maxLength={6}
                      value={formData.aadhaarOtp}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !formData.aadhaarOtp}
                    style={{ width: '100%', padding: '0.8rem', marginTop: '0.75rem' }}
                  >
                    {loading ? 'Verifying Aadhaar...' : 'Verify Aadhaar eKYC'}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ================= STEP 4: SET STRONG PASSWORD ================= */}
          {currentStep === 4 && (
            <form onSubmit={handleStep4SetPassword}>
              <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--success-light)',
                    color: 'var(--success)',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}
                >
                  <Lock size={26} />
                </div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Create Account Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Both email and identity are verified. Finalize your account security.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Create strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password strength checklist */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: 'var(--secondary)' }}>
                  Password Requirements (Bcrypt 12 Rounds):
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <li style={{ color: hasMinLength ? 'var(--success)' : 'var(--text-muted)' }}>
                    {hasMinLength ? '✓' : '○'} At least 8 characters
                  </li>
                  <li style={{ color: hasUpper ? 'var(--success)' : 'var(--text-muted)' }}>
                    {hasUpper ? '✓' : '○'} At least 1 uppercase letter (A-Z)
                  </li>
                  <li style={{ color: hasLower ? 'var(--success)' : 'var(--text-muted)' }}>
                    {hasLower ? '✓' : '○'} At least 1 lowercase letter (a-z)
                  </li>
                  <li style={{ color: hasNumber ? 'var(--success)' : 'var(--text-muted)' }}>
                    {hasNumber ? '✓' : '○'} At least 1 number (0-9)
                  </li>
                  <li style={{ color: hasSpecial ? 'var(--success)' : 'var(--text-muted)' }}>
                    {hasSpecial ? '✓' : '○'} At least 1 special character (@$!%*?&#^~_)
                  </li>
                </ul>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !(hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial)}
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem', fontSize: '1rem' }}
              >
                {loading ? 'Activating Account...' : 'Complete Registration & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterWizardPage;

