import React, { useState } from 'react';
import { useDescope } from '@descope/react-sdk';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Smartphone, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const sdk      = useDescope();

  const [phone,     setPhone]     = useState('');
  const [otp,       setOtp]       = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  const handleSend = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const res = await sdk.otp.signUpOrIn.sms(fullPhone);
      res.ok ? setIsOtpStep(true) : setError('Could not send OTP. Please check your number.');
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const res = await sdk.otp.verify.sms(fullPhone, otp);
      res.ok ? navigate('/onboarding') : setError('Invalid code. Please try again.');
    } catch { setError('Verification failed. Please retry.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="lg-page">

      {/* Blue gradient strip — same as Welcome */}
      <div className="lg-top-strip">
        <div className="lg-circle-1" />
      </div>

      {/* Back button */}
      <div className="lg-back">
        <button
          className="lg-back-btn"
          onClick={() => isOtpStep ? setIsOtpStep(false) : navigate('/')}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Header — on the blue strip */}
      <div className="lg-header">
        <div className="lg-icon-wrap">
          {isOtpStep ? <ShieldCheck size={24} /> : <Smartphone size={24} />}
        </div>
        <div className="lg-header-text">
          <h1 className="lg-title">
            {isOtpStep ? 'Verify Code' : 'Welcome Back'}
          </h1>
          <p className="lg-subtitle">
            {isOtpStep
              ? `Code sent to +91 ${phone}`
              : 'Sign in or create your account'}
          </p>
        </div>
      </div>

      {/* White form card */}
      <AnimatePresence mode="wait">
        {!isOtpStep ? (
          <motion.form
            key="phone"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0,  opacity: 1 }}
            exit={{ x: -30,   opacity: 0 }}
            transition={{ duration: .2 }}
            onSubmit={handleSend}
            className="lg-card"
          >
            <label className="lg-input-label">Mobile Number</label>
            <div className="lg-input-wrap">
              <div className="lg-input-prefix">
                <Smartphone size={14} />
                <span>+91</span>
                <div className="lg-pfx-divider" />
              </div>
              <input
                autoFocus
                type="tel"
                className="lg-input with-prefix"
                placeholder="00000 00000"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>

            {error && (
              <div className="lg-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button className="lg-btn" type="submit" disabled={isLoading || phone.length < 10}>
              {isLoading
                ? <Loader2 size={19} className="spin" />
                : <> Send OTP <ArrowRight size={17} /> </>}
            </button>
          </motion.form>

        ) : (
          <motion.form
            key="otp"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0,  opacity: 1 }}
            exit={{ x: -30,   opacity: 0 }}
            transition={{ duration: .2 }}
            onSubmit={handleVerify}
            className="lg-card"
          >
            <label className="lg-input-label">Verification Code</label>
            <div className="lg-input-wrap">
              <ShieldCheck size={16} className="lg-input-icon" />
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="lg-input otp-input"
                placeholder="——————"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>

            {/* Progress dots */}
            <div className="lg-otp-dots">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`lg-otp-dot${i < otp.length ? ' filled' : ''}`} />
              ))}
            </div>

            {error && (
              <div className="lg-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button className="lg-btn" type="submit" disabled={isLoading || otp.length < 6}>
              {isLoading
                ? <Loader2 size={19} className="spin" />
                : <> Verify &amp; Login <ArrowRight size={17} /> </>}
            </button>

            <button type="button" className="lg-ghost-btn" onClick={() => setIsOtpStep(false)}>
              Change Number
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="lg-footer">
        <p className="lg-terms">
          By continuing you agree to our{' '}
          <span className="lg-terms-link">Terms</span> &amp;{' '}
          <span className="lg-terms-link">Privacy Policy</span>
        </p>
      </div>

    </div>
  );
};

export default Login;
