import { useEffect, useState } from "react";
import { HiArrowDownTray, HiXMark } from "react-icons/hi2";

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
        <HiArrowDownTray className="h-4.5 w-4.5 text-white" />
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
        <HiXMark className="h-4 w-4" />
      </button>
    </div>
  );
}
