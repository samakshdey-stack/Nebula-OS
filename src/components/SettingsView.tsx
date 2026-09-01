import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sparkles,
  Database,
  RotateCcw,
  CheckCircle2,
  LogIn,
  LogOut,
  User,
  Flame,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import firebaseConfig from '../../firebase-applet-config.json';

export const SettingsView: React.FC = () => {
  const {
    resetToDefaults,
    firebaseUser,
    isFirebaseLoading,
    firebaseAuthError,
    loginWithFirebase,
    logoutFirebase,
  } = useNebula();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      await loginWithFirebase();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err?.message || 'Authentication failed');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div id="settings-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-purple-400 font-bold mb-1 font-tech">
          SYSTEM PREFERENCES // KERNEL CONFIG
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
          SYSTEM{' '}
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
            SETTINGS
          </span>
        </h1>
        <p className="text-xs sm:text-sm font-sans text-white/40 mt-1">
          Nebula OS Engine parameters, Firebase authentication, Firestore telemetry, and local state storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firebase Authentication & Cloud Connection */}
        <div className="p-6 rounded-2xl frosty-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="font-tech text-xs font-bold text-white uppercase tracking-wider">
                FIREBASE AUTHENTICATION & CLOUD FIRESTORE
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300">
              ASIA-SOUTHEAST1
            </span>
          </div>

          <div className="space-y-3 text-xs font-tech text-white/80">
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
              <span className="text-white/40">Firebase Project:</span>
              <span className="text-amber-300 font-mono text-[11px]">{firebaseConfig.projectId}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
              <span className="text-white/40">Auth Status:</span>
              <span className={`font-bold flex items-center gap-1.5 ${firebaseUser ? 'text-emerald-400' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${firebaseUser ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'}`} />
                {firebaseUser ? 'AUTHENTICATED' : 'ANONYMOUS / GUEST'}
              </span>
            </div>

            {firebaseUser && (
              <>
                <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
                  <span className="text-white/40">Operator Identity:</span>
                  <span className="text-white font-medium max-w-[200px] truncate">{firebaseUser.displayName || 'Nebula Operator'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
                  <span className="text-white/40">Account Email:</span>
                  <span className="text-purple-300 font-mono text-[11px] max-w-[200px] truncate">{firebaseUser.email}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
                  <span className="text-white/40">Operator UID:</span>
                  <span className="text-white/60 font-mono text-[10px] max-w-[180px] truncate">{firebaseUser.uid}</span>
                </div>
              </>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            {firebaseUser ? (
              <button
                onClick={logoutFirebase}
                className="w-full py-2.5 rounded-xl font-tech text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT FROM FIREBASE</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isSigningIn}
                className="w-full py-2.5 rounded-xl font-tech text-xs font-bold text-slate-950 bg-[#e2e8f0] hover:bg-white border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-700" />
                    <span>AUTHENTICATING WITH GOOGLE...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-purple-700" />
                    <span>AUTHENTICATE OPERATOR VIA FIREBASE</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Core Engine Specs */}
        <div className="p-6 rounded-2xl frosty-card space-y-4">
          <h3 className="font-tech text-xs font-bold text-white uppercase tracking-wider">
            NEBULA RUNTIME ENGINE
          </h3>
          <div className="space-y-3 text-xs font-tech text-white/80">
            <div className="flex justify-between p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
              <span className="text-white/40">System Build:</span>
              <span className="text-purple-300">NEBULA_OS_V2.4_RELEASE</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
              <span className="text-white/40">Active Sector:</span>
              <span className="text-purple-300">HACKATHON_FLEET_01</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
              <span className="text-white/40">Autonomous Sentinel State:</span>
              <span className="text-emerald-400 font-bold">ONLINE & STREAMING</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
              <span className="text-white/40">Persistence Layer:</span>
              <span className="text-white/80 font-bold">Cloud Firestore & Hybrid Cache</span>
            </div>
          </div>
        </div>

        {/* Database Management & State Reset */}
        <div className="p-6 rounded-2xl frosty-card space-y-4 flex flex-col justify-between md:col-span-2">
          <div className="space-y-3">
            <h3 className="font-tech text-xs font-bold text-white uppercase tracking-wider">
              DATABASE & SIMULATION STATE
            </h3>
            <p className="text-xs text-white/50 font-sans leading-relaxed">
              Reset all projects, tasks, dependency DAG vectors, and simulated anomalies back to the pristine seed state.
            </p>
          </div>

          <button
            onClick={resetToDefaults}
            className="w-full py-3 rounded-xl font-tech text-xs font-bold text-white/80 bg-white/5 hover:bg-rose-500/10 hover:text-rose-200 border border-white/10 hover:border-rose-500/40 flex items-center justify-center gap-2 transition-all backdrop-blur-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET DATABASE TO DEFAULT SEED</span>
          </button>
        </div>
      </div>
    </div>
  );
};
