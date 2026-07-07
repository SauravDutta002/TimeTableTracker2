import { useEffect, useState } from "react";

const DISMISS_KEY = "tt-install-dismissed";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (isStandalone || localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="animate-fade-up mb-3 flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-3 pl-4 backdrop-blur-xl">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-white">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-white">Install Timetable</p>
        <p className="truncate text-[11px] text-white/45">Add to your home screen for quick access</p>
      </div>
      <button
        onClick={install}
        className="press shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-black"
      >
        Install
      </button>
      <button onClick={dismiss} className="press shrink-0 p-1 text-white/30">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
