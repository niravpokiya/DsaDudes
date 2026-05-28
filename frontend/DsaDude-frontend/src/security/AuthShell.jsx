
/**
 * @param {{
 * title: string,
 * subtitle: string,
 * highlights?: Array<{ title: string, description: string }>,
 * children: import('react').ReactNode,
 * }} props
 */
const AuthShell = ({
  title,
  subtitle,
  highlights = [
    { title: "Track coding progress", description: "Monitor active submissions effortlessly." },
    { title: "Submit and test solutions", description: "Compile code via containerized runtimes." },
    { title: "Compete with other coders", description: "Scale metrics up global leaderboards." }
  ],
  children,
}) => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {/* Container matching your internal card constraints */}
      <div className="w-full max-w-4xl card overflow-hidden border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-xl">
        
        {/* Decorative Internal Glow Bar using your theme colors */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--accent-light)] to-transparent opacity-60" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[520px]">
          
          {/* Left Panel Column: Information Hub */}
          <section className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--border-primary)] bg-[var(--bg-primary)] p-8 sm:p-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-md border border-[var(--border-glass)] bg-[var(--glass)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-accent)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] animate-pulse" />
                DsaChamp Platform
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                {title}
              </h1>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {subtitle}
              </p>
            </div>

            {/* Structured Feature Highlighting Modules */}
            <div className="mt-8 space-y-3 hidden sm:block">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-[var(--border-primary)] bg-[var(--glass)] p-3.5"
                >
                  <div className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                    {item.title}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-normal">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-[11px] text-[var(--text-muted)] font-medium tracking-wide">
              Protected Session Environment
            </div>
          </section>

          {/* Right Panel Column: Interactive Input Box Area */}
          <section className="lg:col-span-7 flex flex-col justify-center bg-[var(--bg-primary)]/40 p-8 sm:p-12 md:p-14">
            <div className="w-full max-w-sm mx-auto block">
              {children}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
};

export default AuthShell;