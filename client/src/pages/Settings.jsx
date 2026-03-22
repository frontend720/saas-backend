// src/pages/Settings.jsx
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, CreditCard } from 'lucide-react';
import { ME, MY_SUBSCRIPTION } from '../graphql/queries';
import { UPDATE_PROFILE, CHANGE_PASSWORD } from '../graphql/mutations';

const ProfileSection = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saved, setSaved] = useState(false);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: ME }],
    onCompleted: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = { name };
    if (avatar) input.avatar = avatar;
    try {
      await updateProfile({ variables: { input } });
    } catch (err) {
      console.error('Update failed:', err.message);
    }
  };

  return (
    <div className="border border-[#111111] bg-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <User size={18} className="text-[#FF4500]" />
        <h3 className="text-lg font-bold text-[#111111] uppercase">Profile</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full border border-[#111111]/30 px-4 py-3 bg-[#F9F9F9] font-mono text-sm text-[#111111]/50 cursor-not-allowed"
          />
          <p className="font-mono text-[10px] text-[#111111]/40 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Avatar URL</label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 bg-[#FF4500] text-white font-bold uppercase text-sm border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#111111] transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : saved ? 'Saved ✓' : 'Update_Profile'}
        </button>
      </form>
    </div>
  );
};

const PasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword({ variables: { currentPassword, newPassword } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="border border-[#111111] bg-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <Lock size={18} className="text-[#FF4500]" />
        <h3 className="text-lg font-bold text-[#111111] uppercase">Security</h3>
      </div>

      {error && (
        <div className="border border-[#FF4500] bg-[#FF4500]/5 p-3 mb-6 font-mono text-xs text-[#FF4500]">
          {error}
        </div>
      )}

      {success && (
        <div className="border border-[#111111] bg-[#111111]/5 p-3 mb-6 font-mono text-xs text-[#111111]">
          Password updated successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-[#111111] mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 bg-[#111111] text-white font-bold uppercase text-sm border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#FF4500] transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Change_Password'}
        </button>
      </form>
    </div>
  );
};

const SubscriptionSection = ({ subscription, tier }) => (
  <div className="border border-[#111111] bg-white p-8">
    <div className="flex items-center gap-3 mb-6">
      <CreditCard size={18} className="text-[#FF4500]" />
      <h3 className="text-lg font-bold text-[#111111] uppercase">Subscription</h3>
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center py-3 border-b border-[#111111]/10">
        <span className="font-mono text-xs uppercase text-[#111111]/60">Current Tier</span>
        <span className="font-bold text-[#111111] uppercase">{tier || 'free'}</span>
      </div>

      {subscription ? (
        <>
          <div className="flex justify-between items-center py-3 border-b border-[#111111]/10">
            <span className="font-mono text-xs uppercase text-[#111111]/60">Status</span>
            <span className="font-mono text-sm text-[#111111] uppercase">{subscription.status}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#111111]/10">
            <span className="font-mono text-xs uppercase text-[#111111]/60">Billing</span>
            <span className="font-mono text-sm text-[#111111] uppercase">{subscription.interval}ly</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#111111]/10">
            <span className="font-mono text-xs uppercase text-[#111111]/60">Renews</span>
            <span className="font-mono text-sm text-[#111111]">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
          {subscription.cancelAtPeriodEnd && (
            <div className="border border-[#FF4500] bg-[#FF4500]/5 p-3 font-mono text-xs text-[#FF4500]">
              Subscription will cancel at end of billing period
            </div>
          )}
        </>
      ) : (
        <div className="py-6">
          <p className="font-mono text-sm text-[#111111]/60 mb-4">
            You're on the free tier. Upgrade for more storage, assets, and collaboration.
          </p>
          {/* TODO: Wire to Stripe Checkout */}
          <button className="py-3 px-6 bg-[#FF4500] text-white font-bold uppercase text-sm border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#111111] transition-colors">
            Upgrade_Tier
          </button>
        </div>
      )}
    </div>
  </div>
);

export default function Settings() {
  const { data: meData, loading: meLoading } = useQuery(ME);
  const { data: subData } = useQuery(MY_SUBSCRIPTION);

  if (meLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <p className="font-mono text-sm text-[#111111]/60">Loading settings...</p>
      </div>
    );
  }

  const user = meData?.me;
  const subscription = subData?.mySubscription;

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="h-20 border-b border-[#111111] px-6 lg:px-12 flex items-center bg-white">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[#111111] hover:text-[#FF4500] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="font-mono text-xs text-[#111111]/60">
              <span className="text-[#FF4500]">SYSTEM</span> // SETTINGS
            </div>
            <h1 className="text-xl font-bold text-[#111111] uppercase">System_Prefs</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <ProfileSection user={user} />
        <PasswordSection />
        <SubscriptionSection subscription={subscription} tier={user?.tier} />
      </div>
    </div>
  );
}
