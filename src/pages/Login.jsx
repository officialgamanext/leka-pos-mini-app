import React, { useState } from 'react';
import { useDescope, useSession } from '@descope/react-sdk';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const sdk = useDescope();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isStepOtp, setIsStepOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setIsLoading(true);
    setError('');
    try {
      // Note: In a real app, you'd want to handle country codes properly.
      // Assuming phone number is entered with country code or adding a default.
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      const resp = await sdk.otp.signUpOrIn.sms(fullPhone);
      if (resp.ok) {
        setIsStepOtp(true);
      } else {
        setError('Failed to send OTP. Please check your number.');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    setError('');
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const resp = await sdk.otp.verify.sms(fullPhone, otp);
      if (resp.ok) {
        // Session will be updated automatically by the SDK
        navigate('/onboarding');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-column animate-fade-in" style={{ padding: '24px', minHeight: '100vh', background: 'white' }}>
      <button 
        onClick={() => isStepOtp ? setIsStepOtp(false) : navigate('/')}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: '8px', 
          marginLeft: '-8px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          width: 'fit-content'
        }}
      >
        <ChevronLeft size={24} />
      </button>

      <div style={{ marginTop: '32px', marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>
          {isStepOtp ? 'Enter Code' : 'Welcome Back'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          {isStepOtp 
            ? `We've sent a 6-digit code to ${phoneNumber}` 
            : 'Enter your mobile number to get started.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isStepOtp ? (
          <motion.form 
            key="phone-step"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            onSubmit={handleSendOtp}
          >
            <div className="input-group">
              <label className="input-label">MOBILE NUMBER</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '600' }}>
                  <Smartphone size={18} />
                  <span>+91</span>
                  <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
                </div>
                <input 
                  autoFocus
                  type="tel"
                  className="input-field" 
                  placeholder="00000 00000" 
                  style={{ paddingLeft: '85px' }}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={isLoading || phoneNumber.length < 10} style={{ height: '56px', fontSize: '16px' }}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
            </button>
          </motion.form>
        ) : (
          <motion.form 
            key="otp-step"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            onSubmit={handleVerifyOtp}
          >
            <div className="input-group">
              <label className="input-label">VERIFICATION CODE</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  className="input-field" 
                  placeholder="Enter 6-digit code" 
                  style={{ paddingLeft: '44px', letterSpacing: '4px', fontWeight: '700', fontSize: '18px' }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={isLoading || otp.length < 6} style={{ height: '56px', fontSize: '16px' }}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
            </button>

            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={() => setIsStepOtp(false)}
              style={{ marginTop: '12px' }}
            >
              Change Number
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingBottom: 'var(--safe-area-bottom)' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          By continuing, you agree to our <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Terms</span> and <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
