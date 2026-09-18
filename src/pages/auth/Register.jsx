import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  ShieldCheck,
  RefreshCw,
  Leaf,
  User,
  Building2,
  Gift,
  HandHeart,
  ArrowRight,
  MapPin,
  Phone,
  Globe,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OTP_DURATION = 90;

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    verifyRegistrationOTP,
    resendRegistrationOTP,
  } = useAuth();

  // -----------------------------
  // Registration state
  // -----------------------------
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('INDIVIDUAL');
  const [role, setRole] = useState('DONOR');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: '',
    city: '',
    country: '',
    organization_name: '',
    organization_type: '',
    license_number: '',
    org_description: '',
    preferred_categories: [],
    needed_categories: [],
  });

  // -----------------------------
  // UI state
  // -----------------------------
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // -----------------------------
  // OTP state
  // -----------------------------
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_DURATION);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const otpInputRef = useRef(null);

  // -----------------------------
  // Password rules
  // -----------------------------
  const passwordRules = [
    {
      key: 'length',
      label: 'At least 8 characters',
      test: (password) => password.length >= 8,
    },
    {
      key: 'uppercase',
      label: 'One uppercase letter',
      test: (password) => /[A-Z]/.test(password),
    },
    {
      key: 'lowercase',
      label: 'One lowercase letter',
      test: (password) => /[a-z]/.test(password),
    },
    {
      key: 'number',
      label: 'One number',
      test: (password) => /\d/.test(password),
    },
    {
      key: 'special',
      label: 'One special character',
      test: (password) => /[^A-Za-z0-9]/.test(password),
    },
  ];

  // -----------------------------
  // Toast
  // -----------------------------
  const showToast = (message, type = 'error') => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // -----------------------------
  // OTP countdown
  // -----------------------------
  useEffect(() => {
    if (!showOTP || otpTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOTP, otpTimeLeft]);

  // -----------------------------
  // Focus OTP input
  // -----------------------------
  useEffect(() => {
    if (!showOTP) {
      return;
    }

    const timer = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [showOTP]);

  // -----------------------------
  // Form change
  // -----------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------
  // OTP change
  // -----------------------------
  const handleOTPChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, '')
      .slice(0, 6);

    setOtp(value);
  };

  // -----------------------------
  // Timer format
  // -----------------------------
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // -----------------------------
  // Email validation
  // -----------------------------
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // -----------------------------
  // Password validation
  // -----------------------------
  const isPasswordValid = () => {
    return passwordRules.every((rule) => rule.test(form.password));
  };

  // -----------------------------
  // Navigation
  // -----------------------------
  const handleNext = () => {
    if (step < 3) {
      setStep((previous) => previous + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  };

  // -----------------------------
  // Registration
  // -----------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    // Validation
    if (!name) {
      showToast('Please enter your name.');
      return;
    }

    if (!email) {
      showToast('Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    if (!form.password) {
      showToast('Please enter a password.');
      return;
    }

    if (!isPasswordValid()) {
      showToast('Please complete all password requirements.');
      return;
    }

    if (form.password !== form.confirm_password) {
      showToast('Passwords do not match.');
      return;
    }

    if (
      accountType === 'ORGANIZATION' &&
      !form.organization_name.trim()
    ) {
      showToast('Please enter your organization name.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        name,
        email,
        account_type: accountType,
        role,
      };

      console.log('Register payload:', payload);

      const response = await register(payload);

      console.log('Register response:', response);

      const registeredEmail =
        response?.email ||
        response?.user?.email ||
        email;

      setOtpEmail(registeredEmail);
      setOtp('');
      setOtpTimeLeft(
        Number(response?.expires_in) || OTP_DURATION
      );
      setShowOTP(true);

      showToast(
        'A 6-digit OTP has been sent to your email.',
        'success'
      );
    } catch (error) {
      console.error('Registration failed:', error);

      const responseData = error?.response?.data;

      console.error('Registration error response:', responseData);

      // Duplicate email
      if (
        responseData?.email?.[0] ===
          'This email is already registered.' ||
        responseData?.error ===
          'This email is already registered.' ||
        responseData?.detail ===
          'This email is already registered.'
      ) {
        showToast('This email is already registered.');
        return;
      }

      // DRF validation errors
      if (
        responseData &&
        typeof responseData === 'object'
      ) {
        const firstError = Object.values(responseData)
          .flat(Infinity)
          .find(
            (value) =>
              typeof value === 'string' && value.trim()
          );

        if (firstError) {
          showToast(firstError);
          return;
        }
      }

      showToast(
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Verify OTP
  // -----------------------------
  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    if (otpLoading) {
      return;
    }

    if (otpTimeLeft <= 0) {
      showToast(
        'OTP has expired. Please resend a new OTP.'
      );
      return;
    }

    if (otp.length !== 6) {
      showToast('Please enter the 6-digit OTP.');
      return;
    }

    try {
      setOtpLoading(true);

      const user = await verifyRegistrationOTP(
        otpEmail,
        otp
      );

      showToast(
        'Email verified successfully! Welcome aboard! 🌱',
        'success'
      );

      setTimeout(() => {
        if (user?.role === 'DONOR') {
          navigate('/donor', {
            replace: true,
          });
        } else {
          navigate('/receiver', {
            replace: true,
          });
        }
      }, 500);
    } catch (error) {
      console.error(
        'OTP verification failed:',
        error
      );

      const data = error?.response?.data;

      if (data?.otp_expired) {
        setOtpTimeLeft(0);

        showToast(
          'OTP has expired. Please resend a new OTP.'
        );

        return;
      }

      if (data?.detail || data?.error) {
        showToast(
          data.detail || data.error
        );

        return;
      }

      if (data?.otp) {
        showToast(
          Array.isArray(data.otp)
            ? data.otp[0]
            : String(data.otp)
        );

        return;
      }

      showToast(
        'Invalid OTP. Please try again.'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // -----------------------------
  // Resend OTP
  // -----------------------------
  const handleResendOTP = async () => {
    if (resendLoading) {
      return;
    }

    try {
      setResendLoading(true);

      const response =
        await resendRegistrationOTP(otpEmail);

      setOtp('');
      setOtpTimeLeft(
        Number(response?.expires_in) || OTP_DURATION
      );

      showToast(
        'A new OTP has been sent to your email.',
        'success'
      );

      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error(
        'OTP resend failed:',
        error
      );

      const data = error?.response?.data;

      if (data?.detail) {
        showToast(data.detail);
        return;
      }

      if (data?.error) {
        showToast(data.error);
        return;
      }

      showToast(
        'Could not resend OTP. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  // -----------------------------
  // Back from OTP
  // -----------------------------
  const handleBackFromOTP = () => {
    setShowOTP(false);
    setOtp('');
    setOtpTimeLeft(OTP_DURATION);
  };

  // -----------------------------
  // Shared classes
  // -----------------------------
  const inputWithIconClass =
    'w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition';

  // =========================================================
  // OTP SCREEN
  // =========================================================
  if (showOTP) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-green-200/40 blur-3xl pointer-events-none" />

        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />

        {toast && (
          <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-2rem)] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] border border-white p-7 sm:p-9">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-100 px-4 py-2">
                <img src="/images/IMG-20260831-WA0000.jpg.jpeg" alt="SecondLife" className="w-6 h-6 rounded-lg object-cover" />
                <span className="text-sm font-bold text-green-700">SecondLife</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackFromOTP}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-green-600 transition mb-7"
            >
              <ArrowLeft size={17} />
              Back to registration
            </button>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-green-200 blur-xl opacity-60" />

                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 flex items-center justify-center">
                  <ShieldCheck
                    size={39}
                    className="text-green-600"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Verify your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter the 6-digit verification code we sent to
              </p>

              <div className="mt-3 inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-green-50 border border-green-100 px-3 py-2 text-green-700 font-semibold text-sm">
                <Mail size={16} />

                <span className="break-all">
                  {otpEmail}
                </span>
              </div>
            </div>

            <form
              onSubmit={handleVerifyOTP}
              className="mt-8"
            >
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Verification code
              </label>

              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                className="w-full text-center tracking-[0.65em] text-2xl font-extrabold border-2 border-slate-200 bg-slate-50 rounded-2xl px-4 py-4 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
              />

              <div className="mt-5 flex justify-center">
                {otpTimeLeft > 0 ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-slate-500">
                    <span>Code expires in</span>

                    <span className="font-extrabold text-green-600">
                      {formatTime(otpTimeLeft)}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-500">
                    OTP expired
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  otpLoading ||
                  otp.length !== 6 ||
                  otpTimeLeft <= 0
                }
                className="group w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-200/60 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  'Verifying...'
                ) : (
                  <>
                    <span>Verify Email</span>

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {otpTimeLeft <= 0 ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      resendLoading
                        ? 'animate-spin'
                        : ''
                    }
                  />

                  {resendLoading
                    ? 'Sending...'
                    : 'Resend OTP'}
                </button>
              ) : (
                <p className="text-sm text-slate-400">
                  You can request a new OTP after this code expires.
                </p>
              )}
            </div>

            <div className="mt-7 flex gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <ShieldCheck
                size={19}
                className="text-green-600 flex-shrink-0 mt-0.5"
              />

              <p className="text-xs text-slate-500 leading-5">
                Your verification code is valid for only 1 minute and 30 seconds. Never share your OTP with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NORMAL REGISTRATION SCREEN
  // =========================================================
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-8 sm:py-10">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-green-200/30 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-emerald-200/25 blur-3xl pointer-events-none" />

      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-2rem)] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Brand */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white px-4 py-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center">
              <img src="/images/IMG-20260831-WA0000.jpg.jpeg" alt="SecondLife" className="w-full h-full object-cover" />
            </div>

            <div className="text-left">
              <div className="font-extrabold text-lg text-slate-900">
                SecondLife
              </div>

              <div className="text-xs text-slate-500">
                Give. Share. Reuse.
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100/80 border border-green-200 px-4 py-2 text-xs font-bold text-green-700">
            <HandHeart size={15} />
            Join the SecondLife community
          </span>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Create your account
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-6">
            Create your account and help useful items find their next home.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((number, index) => (
              <React.Fragment key={number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`relative w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold transition-all duration-300 ${
                      step >= number
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-200'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {step > number ? (
                      <Check size={20} />
                    ) : (
                      number
                    )}
                  </div>

                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-bold ${
                      step >= number
                        ? 'text-green-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {number === 1
                      ? 'Account'
                      : number === 2
                      ? 'Purpose'
                      : 'Details'}
                  </span>
                </div>

                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                      step > number
                        ? 'bg-green-600'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_30px_90px_-35px_rgba(15,23,42,0.3)] border border-white overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* =================================================
                STEP 1
            ================================================= */}
            {step === 1 && (
              <div className="p-6 sm:p-9 lg:p-12">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User
                        size={24}
                        className="text-green-600"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Choose account type
                      </h2>

                      <p className="text-sm sm:text-base text-slate-500 mt-1">
                        Tell us what kind of account you want to create.
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Individual */}
                    <button
                      type="button"
                      onClick={() =>
                        setAccountType('INDIVIDUAL')
                      }
                      className={`group relative text-left rounded-3xl border-2 p-6 transition-all duration-200 ${
                        accountType === 'INDIVIDUAL'
                          ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                          : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      {accountType === 'INDIVIDUAL' && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center">
                          <Check size={15} />
                        </div>
                      )}

                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                          accountType === 'INDIVIDUAL'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                        }`}
                      >
                        <User size={27} />
                      </div>

                      <h3 className="font-extrabold text-xl text-slate-900">
                        Individual
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 leading-6">
                        Create a personal account for donating or receiving items.
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-green-600">
                        Personal account
                        <ArrowRight size={14} />
                      </div>
                    </button>

                    {/* Organization */}
                    <button
                      type="button"
                      onClick={() =>
                        setAccountType('ORGANIZATION')
                      }
                      className={`group relative text-left rounded-3xl border-2 p-6 transition-all duration-200 ${
                        accountType === 'ORGANIZATION'
                          ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                          : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      {accountType === 'ORGANIZATION' && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center">
                          <Check size={15} />
                        </div>
                      )}

                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                          accountType === 'ORGANIZATION'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                        }`}
                      >
                        <Building2 size={27} />
                      </div>

                      <h3 className="font-extrabold text-xl text-slate-900">
                        Organization
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 leading-6">
                        Register an organization, charity, or community group.
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-green-600">
                        Organization account
                        <ArrowRight size={14} />
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="group w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-200/60 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transition flex items-center justify-center gap-2"
                  >
                    Continue

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                STEP 2
            ================================================= */}
            {step === 2 && (
              <div className="p-6 sm:p-9 lg:p-12">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <HandHeart
                        size={24}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        What brings you here?
                      </h2>

                      <p className="text-sm sm:text-base text-slate-500 mt-1">
                        Choose whether you want to donate or receive items.
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Donor */}
                    <button
                      type="button"
                      onClick={() => setRole('DONOR')}
                      className={`group relative text-left rounded-3xl border-2 p-6 transition-all duration-200 ${
                        role === 'DONOR'
                          ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                          : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      {role === 'DONOR' && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center">
                          <Check size={15} />
                        </div>
                      )}

                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                          role === 'DONOR'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                        }`}
                      >
                        <Gift size={27} />
                      </div>

                      <h3 className="font-extrabold text-xl text-slate-900">
                        I want to donate
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 leading-6">
                        Give useful items a second life by sharing them with others.
                      </p>

                      <div className="mt-5 text-xs font-bold text-green-600">
                        Share useful items →
                      </div>
                    </button>

                    {/* Receiver */}
                    <button
                      type="button"
                      onClick={() => setRole('RECEIVER')}
                      className={`group relative text-left rounded-3xl border-2 p-6 transition-all duration-200 ${
                        role === 'RECEIVER'
                          ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                          : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      {role === 'RECEIVER' && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center">
                          <Check size={15} />
                        </div>
                      )}

                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                          role === 'RECEIVER'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                        }`}
                      >
                        <HandHeart size={27} />
                      </div>

                      <h3 className="font-extrabold text-xl text-slate-900">
                        I need items
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 leading-6">
                        Find useful items shared by people and organizations.
                      </p>

                      <div className="mt-5 text-xs font-bold text-green-600">
                        Find useful items →
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <ArrowLeft size={17} />
                        Back
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="group flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-200/60 hover:from-green-700 hover:to-emerald-700 transition"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        Continue

                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                STEP 3
            ================================================= */}
            {step === 3 && (
              <div className="p-6 sm:p-9 lg:p-12">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User
                        size={24}
                        className="text-green-600"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Your details
                      </h2>

                      <p className="text-sm sm:text-base text-slate-500 mt-1">
                        Enter your information to create your account.
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Full name
                      </label>

                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          autoComplete="name"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Contact number
                      </label>

                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Contact number"
                          autoComplete="tel"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        City
                      </label>

                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Your city"
                          autoComplete="address-level2"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Country
                      </label>

                      <div className="relative">
                        <Globe
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type="text"
                          name="country"
                          value={form.country}
                          onChange={handleChange}
                          placeholder="Country"
                          autoComplete="country-name"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Address
                      </label>

                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Your address"
                          autoComplete="street-address"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Password
                      </label>

                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-12 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (previous) => !previous
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>
                      </div>

                      <div className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {passwordRules.map((rule) => {
                          const passed = rule.test(
                            form.password
                          );

                          return (
                            <div
                              key={rule.key}
                              className={`flex items-center gap-2 text-xs ${
                                passed
                                  ? 'text-green-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                  passed
                                    ? 'bg-green-100'
                                    : 'bg-slate-100'
                                }`}
                              >
                                {passed ? (
                                  <Check size={11} />
                                ) : (
                                  <X size={10} />
                                )}
                              </span>

                              <span>{rule.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Confirm password
                      </label>

                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />

                        <input
                          type={
                            showConfirmPassword
                              ? 'text'
                              : 'password'
                          }
                          name="confirm_password"
                          value={form.confirm_password}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-12 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (previous) => !previous
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          aria-label={
                            showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>
                      </div>

                      {form.confirm_password && (
                        <div
                          className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
                            form.password ===
                            form.confirm_password
                              ? 'text-green-600'
                              : 'text-red-500'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              form.password ===
                              form.confirm_password
                                ? 'bg-green-100'
                                : 'bg-red-50'
                            }`}
                          >
                            {form.password ===
                            form.confirm_password ? (
                              <Check size={11} />
                            ) : (
                              <X size={11} />
                            )}
                          </span>

                          {form.password ===
                          form.confirm_password
                            ? 'Passwords match'
                            : 'Passwords do not match'}
                        </div>
                      )}
                    </div>

                    {/* Organization fields */}
                    {accountType === 'ORGANIZATION' && (
                      <>
                        {/* Organization name */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Organization name
                          </label>

                          <div className="relative">
                            <Building2
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />

                            <input
                              type="text"
                              name="organization_name"
                              value={
                                form.organization_name
                              }
                              onChange={handleChange}
                              placeholder="Organization name"
                              className={inputWithIconClass}
                            />
                          </div>
                        </div>

                        {/* Organization type */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Organization type
                          </label>

                          <div className="relative">
                            <Building2
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />

                            <input
                              type="text"
                              name="organization_type"
                              value={
                                form.organization_type
                              }
                              onChange={handleChange}
                              placeholder="e.g. Charity, NGO"
                              className={inputWithIconClass}
                            />
                          </div>
                        </div>

                        {/* License */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            License number
                          </label>

                          <div className="relative">
                            <ShieldCheck
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />

                            <input
                              type="text"
                              name="license_number"
                              value={
                                form.license_number
                              }
                              onChange={handleChange}
                              placeholder="License number"
                              className={inputWithIconClass}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Organization description
                          </label>

                          <textarea
                            name="org_description"
                            value={
                              form.org_description
                            }
                            onChange={handleChange}
                            rows={4}
                            placeholder="Tell us about your organization..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition resize-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <ArrowLeft size={17} />
                        Back
                      </span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-200/60 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {loading
                          ? 'Creating account...'
                          : 'Create Account'}

                        {!loading && (
                          <ArrowRight
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        )}
                      </span>
                    </button>
                  </div>

                  {/* OTP explanation */}
                  <div className="mt-6 flex gap-3 rounded-2xl bg-green-50 border border-green-100 p-4">
                    <Mail
                      size={20}
                      className="text-green-600 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-xs text-green-800 leading-5">
                      After creating your account, we will send a 6-digit OTP to your email. You will have 1 minute and 30 seconds to verify your email.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Login */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-bold text-green-600 hover:text-green-700 transition"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-5 flex justify-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck
              size={14}
              className="text-green-500"
            />

            Email verification helps protect your account.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;