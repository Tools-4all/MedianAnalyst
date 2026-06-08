import { useState, useEffect, useMemo } from 'react';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  adminEmails,
  auth,
  isAdminAllowlistConfigured,
  isFirebaseConfigured,
} from '../lib/firebase';

function isAllowedAdmin(email) {
  if (!email || adminEmails.size === 0) {
    return false;
  }

  return adminEmails.has(email.toLowerCase());
}

function getAuthErrorMessage(error) {
  const code = error?.code || '';

  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Invalid email or password.';
  }

  if (code === 'auth/user-not-found') {
    return 'This user does not exist in Firebase Authentication.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Wait a moment and try again.';
  }

  return error?.message || 'Login failed.';
}

export default function AdminShellPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(
    () => Boolean(auth && isFirebaseConfigured),
  );
  const [authError, setAuthError] = useState('');
  const [resetNotice, setResetNotice] = useState('');

  const isAdmin = useMemo(() => isAllowedAdmin(currentUser?.email), [currentUser]);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!auth) {
      setAuthError('Firebase Auth is not configured.');
      return;
    }

    setAuthError('');
    setResetNotice('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!isAllowedAdmin(credential.user.email)) {
        await signOut(auth);
        setAuthError('Your account is not allowed to access this admin panel.');
      }
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  };

  const handleResetPassword = async () => {
    if (!auth) {
      setAuthError('Firebase Auth is not configured.');
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setAuthError('Enter your email first, then click Reset Password.');
      return;
    }

    setAuthError('');
    setResetNotice('');

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setResetNotice('Password reset email sent. Check your inbox and spam folder.');
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
          <h1 className="font-headline-md text-primary">Admin Setup Required</h1>
          <p className="font-body-md text-on-surface-variant">
            Firebase is not configured yet. Add your Vite Firebase variables and reload the app.
          </p>
          <Link to="/" className="text-secondary font-label-sm hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdminAllowlistConfigured) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
          <h1 className="font-headline-md text-primary">Admin Allowlist Required</h1>
          <p className="font-body-md text-on-surface-variant">
            Set <strong>VITE_ADMIN_EMAILS</strong> in your .env file to at least one admin email.
          </p>
          <Link to="/" className="text-secondary font-label-sm hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-2xl mx-auto">Checking authentication...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h1 className="font-headline-sm text-primary mb-4">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-email" className="font-label-sm text-on-surface-variant">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-password" className="font-label-sm text-on-surface-variant">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-white"
                required
              />
            </div>

            {authError && <p className="text-error font-label-sm">{authError}</p>}
            {resetNotice && <p className="text-secondary font-label-sm">{resetNotice}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-on-primary rounded-lg px-4 py-2 font-label-sm"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={handleResetPassword}
              className="w-full border border-outline-variant rounded-lg px-4 py-2 font-label-sm"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-3">
          <h1 className="font-headline-sm text-primary">Access Denied</h1>
          <p className="font-body-md text-on-surface-variant">
            Your account is authenticated but not allowlisted for admin access.
          </p>
          <button onClick={handleLogout} className="text-secondary font-label-sm hover:underline">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 md:px-8 py-8 space-y-6">
      <header className="max-w-[1500px] mx-auto bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h1 className="font-headline-sm text-primary">Admin Workspace</h1>
          <p className="font-label-sm text-on-surface-variant">Signed in as {currentUser.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="border border-outline-variant rounded-lg px-4 py-2 font-label-sm"
        >
          Sign out
        </button>
      </header>

      <nav className="max-w-[1500px] mx-auto bg-surface-container-lowest border border-outline-variant rounded-2xl p-2 flex items-center gap-2">
        <NavLink
          to="blogs"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg font-label-sm ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-on-surface hover:bg-surface-container-low'
            }`
          }
        >
          Blogs
        </NavLink>
        <NavLink
          to="calculator-consts"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg font-label-sm ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-on-surface hover:bg-surface-container-low'
            }`
          }
        >
          Calculator Consts
        </NavLink>
      </nav>

      <div className="max-w-[1500px] mx-auto">
        <Outlet context={{ currentUser }} />
      </div>
    </div>
  );
}
