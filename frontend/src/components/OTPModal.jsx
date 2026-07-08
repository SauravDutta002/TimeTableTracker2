import { useState } from "react";

export default function OTPModal({ onComplete }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp === "0208") {
      onComplete("friend");
    } else if (otp === "") {
      onComplete("you");
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[32px] bg-zinc-900 p-6 ring-1 ring-white/10">
        <h2 className="mb-2 text-2xl font-semibold text-white">Welcome!</h2>
        <p className="mb-6 text-sm text-white/60">
          Enter OTP if you are Parvaaz, or just continue if you are Saurav.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError(false);
              }}
              className={`w-full rounded-2xl bg-white/5 px-4 py-3 text-white outline-none transition-all focus:bg-white/10 focus:ring-2 ${
                error ? "ring-2 ring-rose-500" : "focus:ring-white/20"
              }`}
            />
            {error && <p className="mt-2 text-xs text-rose-400">Incorrect OTP.</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onComplete("you")}
              className="flex-1 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white hover:bg-white/15 active:scale-95 transition-all"
            >
              I am Saurav
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
