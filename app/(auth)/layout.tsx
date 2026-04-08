export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#080c1a" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.15) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            THỐNG TRỊ FACEBOOK
          </h1>
          <p className="text-white/60 text-lg">
            Công cụ Copy Viral đối thủ tối thượng.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
