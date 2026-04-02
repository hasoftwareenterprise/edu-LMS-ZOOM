import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ZoomMtg } from '@zoom/meetingsdk';

// Mandatory CSS for version 5.1.4+
import '@zoom/meetingsdk/dist/ui/zoom-meetingsdk.css';

// SDK requires globals in bundler environments
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

// Global SDK configuration
ZoomMtg.setZoomJSLib('https://source.zoom.us/5.1.4/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

interface ZoomMeetingSDKProps {
  meetingNumber: string;
  passWord: string; // Matches App.tsx camelCase
  userName: string;
  userEmail: string;
  signature: string;
  sdkKey: string;
  onLeave?: () => void;
}

const ZoomMeetingSDK: React.FC<ZoomMeetingSDKProps> = ({
  meetingNumber,
  passWord,
  userName,
  userEmail,
  signature,
  sdkKey,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Initializing Client...");

  useEffect(() => {
    let isMounted = true;
    
    // Hide standard React root to prevent overlap
    const rootEl = document.getElementById('root');
    const zoomEl = document.getElementById('zmmtg-root');
    
    if (rootEl) rootEl.style.display = 'none';
    if (zoomEl) zoomEl.style.display = 'block';

    const startMeeting = async () => {
      try {
        // Critical: Client View SDK V5+ requires SharedArrayBuffer to decode video
        if (typeof (window as any).SharedArrayBuffer === 'undefined') {
          console.error("Zoom Error: SharedArrayBuffer is not available. Please verify COOP/COEP headers.");
          if (isMounted) {
            setError("Browser Security Conflict: High-performance video decoding (SharedArrayBuffer) is missing. Ensure you are using HTTPS and the security headers are correctly configured.");
          }
          return;
        }

        console.log("Zoom: Cleaning up stale clients...");
        // Attempts to clear any partial global state from previous runs
        if (typeof (ZoomMtg as any).destroy === 'function') {
           (ZoomMtg as any).destroy();
        }

        setStatus("Loading secure signatures...");
        
        ZoomMtg.init({
          leaveUrl: window.location.origin + '/dashboard', 
          showMeetingHeader: true,
          success: () => {
            console.log("Zoom: Init Success. Propagating join...");
            setStatus("Synchronizing with meeting server...");
            
            ZoomMtg.join({
              signature,
              sdkKey,
              meetingNumber,
              passWord,
              userName,
              userEmail,
              success: () => {
                console.log("Zoom: Official Join Success");
                if (isMounted) setStatus("Joining...");
              },
              error: (err: any) => {
                console.error("Zoom Join Error:", err);
                if (isMounted) {
                  setError(`Join Failed (${err.errorCode}): ${err.errorMessage || 'Check meeting ID/Password'}`);
                  if (rootEl) rootEl.style.display = 'block';
                }
              }
            });
          },
          error: (err: any) => {
            console.error("Zoom Init Error:", err);
            if (isMounted) {
              setError(`Init Failed (${err.errorCode}): ${err.errorMessage || 'Browser requirements not met'}`);
              if (rootEl) rootEl.style.display = 'block';
            }
          }
        });
      } catch (e: any) {
         console.error("Zoom Crash:", e);
         if (isMounted) setError(`SDK Runtime Crash: ${e.message}`);
      }
    };

    // Delay start to allow DOM anchors (#zmmtg-root) to stabilize
    const timer = setTimeout(startMeeting, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (rootEl) rootEl.style.display = 'block';
      if (zoomEl) zoomEl.style.display = 'none';
    };
  }, [meetingNumber, passWord, userName, userEmail, signature, sdkKey]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-8">
        <div className="bg-red-50 p-10 rounded-3xl border border-red-100 max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold shadow-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Interface
          </button>
        </div>
      </div>
    );
  }

  // The black screen usually happens if this overlay stays up forever.
  // Zoom Client View should eventually render its own UI over/behind this.
  return (
    <div className="fixed inset-0 z-[99998] bg-gray-950 flex flex-col items-center justify-center font-sans">
      <div className="flex gap-2 mb-10">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <p className="text-white text-2xl font-black italic tracking-tighter uppercase mb-2">Live Session</p>
      <p className="text-gray-400 text-sm font-medium tracking-widest uppercase opacity-60">{status}</p>
    </div>
  );
};

export default ZoomMeetingSDK;
