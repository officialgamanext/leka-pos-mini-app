import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useBusiness } from '../App';
import { useSession } from '@descope/react-sdk';
import { useToast } from '../components/Toast';
import { businessApi } from '../api/client';
import { Receipt, Save, Loader2, MapPin, Percent, Info, ReceiptText } from 'lucide-react';
import { motion } from 'framer-motion';

const TaxSettings = () => {
  const { sessionToken } = useSession();
  const { activeBusiness, selectBusiness } = useBusiness();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: activeBusiness?.name || '',
    address: activeBusiness?.address || '',
    gstEnabled: activeBusiness?.gstEnabled || false,
    gstPercentage: activeBusiness?.gstPercentage || 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await businessApi.update(activeBusiness.id, formData, sessionToken);
      // Update global context
      selectBusiness({ ...activeBusiness, ...formData });
      showToast('Settings updated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout backPath="/profile">
      <div className="ab-page" style={{ paddingBottom: 100 }}>

        {/* Header */}
        <div className="ab-hero" style={{ background: 'linear-gradient(170deg, #F59E0B 0%, #D97706 100%)' }}>
          <div>
            <p className="ab-hero-label">Configure Invoicing</p>
            <div className="ab-hero-amount">Tax & GST</div>
            <p className="ab-hero-count">Manage your tax preferences</p>
          </div>
          <div className="ab-hero-icon-wrap"><ReceiptText size={26} /></div>
          <div className="ab-hero-bg"><ReceiptText size={110} /></div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ab-list"
          onSubmit={handleSubmit}
          style={{ marginTop: 0, background: 'var(--surface)', borderRadius: 24, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          {/* Business Info */}
          <div className="pf-section-label">Business Identity</div>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Business Name</label>
            <input
              className="input-field"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Store Name"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} /> Full Address
            </label>
            <textarea
              className="input-field"
              style={{ height: 80, padding: 12, resize: 'none' }}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot No. 123, Road 4, City, State - 500000"
            />
            <p style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 4 }}>
              This address will appear on your printed receipts.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          {/* GST Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Enable GST</p>
              <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>Add tax line to bills & receipts</p>
            </div>
            <div
              onClick={() => setFormData({ ...formData, gstEnabled: !formData.gstEnabled })}
              style={{
                width: 44, height: 24, borderRadius: 12, padding: 2,
                background: formData.gstEnabled ? '#10B981' : '#E2E8F0',
                cursor: 'pointer', transition: 'background 0.3s', display: 'flex',
                justifyContent: formData.gstEnabled ? 'flex-end' : 'flex-start'
              }}
            >
              <motion.div layout style={{ width: 20, height: 20, borderRadius: 10, background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </div>
          </div>

          {/* GST Percentage */}
          {formData.gstEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="input-group"
            >
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Percent size={14} /> GST Percentage (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className="input-field"
                  value={formData.gstPercentage}
                  onChange={e => setFormData({ ...formData, gstPercentage: e.target.value })}
                  placeholder="5"
                  min="0"
                  max="100"
                />
              </div>
              <div className="pf-info-box" style={{ marginTop: 12, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <Info size={14} style={{ color: '#D97706', flexShrink: 0 }} />
                <p style={{ fontSize: 10, color: '#92400E', lineHeight: 1.4 }}>
                  Current Logic: The tax will be <b>added</b> to the subtotal. If subtotal is ₹100 and GST is 5%, Grand Total will be ₹105.
                </p>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 32, height: 50, borderRadius: 15 }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="spin" size={20} /> : <><Save size={18} /> Save Settings</>}
          </button>
        </motion.form>

      </div>
    </AppLayout>
  );
};

export default TaxSettings;
