import React from "react";

const PlaceholderLine = ({ w = "100%", className = "" }) => (
  <div
    className={`h-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-700/60 ${className}`}
    style={{ width: w }}
    aria-hidden="true"
  />
);

const PlaceholderBlock = ({ widths = ["100%", "92%", "78%"] }) => (
  <div className="space-y-1.5">
    {widths.map((w, i) => (
      <PlaceholderLine key={i} w={w} />
    ))}
  </div>
);

const skillsList = (form) =>
  (form.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// ─────── Modern Template Preview ───────
function ModernPreview({ form }) {
  return (
    <div className="bg-white text-zinc-900 h-full flex flex-col">
      <div className="bg-[#00d96f] flex flex-col items-center justify-center py-5 text-center">
        {form.photo && (
          <div className="relative mb-2">
            <div className="absolute inset-0 -m-1 rounded-full bg-white" />
            <img
              src={form.photo}
              alt=""
              className="relative h-12 w-12 rounded-full object-cover"
            />
          </div>
        )}
        <div className="text-[10px] font-bold text-black tracking-tight px-2 truncate max-w-full">
          {form.name || "Your name"}
        </div>
        <div className="text-[7px] text-emerald-900 mt-0.5 px-2 truncate max-w-full">
          {form.jobTitle || "Job title"}
        </div>
      </div>
      {(form.email || form.phone) && (
        <div className="text-center text-[6px] text-zinc-500 py-1.5 border-b border-zinc-100 truncate px-2">
          {[form.email, form.phone].filter(Boolean).join("  •  ")}
        </div>
      )}
      <div className="flex-1 p-3 space-y-3 overflow-hidden">
        <Section accent="text-[#00a350]" line title="SUMMARY">
          <PlaceholderBlock />
        </Section>
        {skillsList(form).length > 0 && (
          <Section accent="text-[#00a350]" line title="SKILLS">
            <div className="flex flex-wrap gap-0.5">
              {skillsList(form)
                .slice(0, 6)
                .map((s, i) => (
                  <span
                    key={i}
                    className="px-1 py-0.5 text-[6px] font-medium bg-zinc-100 text-zinc-700 rounded"
                  >
                    {s}
                  </span>
                ))}
            </div>
          </Section>
        )}
        <Section accent="text-[#00a350]" line title="EXPERIENCE">
          <PlaceholderBlock />
          <PlaceholderBlock widths={["88%", "82%"]} />
        </Section>
      </div>
    </div>
  );
}

// ─────── Classic Template Preview ───────
function ClassicPreview({ form }) {
  return (
    <div className="bg-zinc-50/50 text-zinc-900 h-full flex flex-col p-3">
      <div className="text-center pt-2">
        {form.photo && (
          <img
            src={form.photo}
            alt=""
            className="h-10 w-10 rounded-full object-cover mx-auto mb-2 ring-2 ring-[#1a2845]"
          />
        )}
        <div
          className="text-[10px] font-bold tracking-[0.15em] text-[#1a2845] truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {(form.name || "Your name").toUpperCase()}
        </div>
        <div
          className="text-[7px] italic text-zinc-500 mt-0.5 truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {form.jobTitle || "Job title"}
        </div>
        <div className="my-2 border-t border-b border-[#1a2845] h-0.5 mx-6" />
        {(form.email || form.phone) && (
          <div
            className="text-[6px] text-zinc-700 truncate"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {[form.email, form.phone].filter(Boolean).join("  |  ")}
          </div>
        )}
      </div>
      <div className="flex-1 mt-3 space-y-3">
        <CenterSection title="SUMMARY" accent="text-[#1a2845]">
          <PlaceholderBlock />
        </CenterSection>
        <CenterSection title="EXPERIENCE" accent="text-[#1a2845]">
          <PlaceholderBlock />
          <PlaceholderBlock widths={["80%", "70%"]} />
        </CenterSection>
      </div>
    </div>
  );
}

// ─────── Creative Template Preview (sidebar) ───────
function CreativePreview({ form }) {
  return (
    <div className="h-full flex bg-white">
      <div className="w-[35%] bg-[#0a0a0a] text-white p-2 flex flex-col items-center text-center">
        {form.photo && (
          <img
            src={form.photo}
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#c8593a] mb-1.5"
          />
        )}
        <div className="text-[8px] font-bold tracking-tight truncate w-full">
          {form.name || "Your name"}
        </div>
        <div className="text-[6px] text-[#c8593a] mt-0.5 truncate w-full">
          {form.jobTitle || "Job title"}
        </div>
        {(form.email || form.phone) && (
          <>
            <div className="mt-3 text-[6px] font-bold text-[#c8593a] tracking-widest">
              CONTACT
            </div>
            <div className="text-[5px] text-zinc-300 mt-0.5 truncate w-full px-0.5">
              {form.email}
            </div>
            <div className="text-[5px] text-zinc-300 truncate w-full px-0.5">
              {form.phone}
            </div>
          </>
        )}
        {skillsList(form).length > 0 && (
          <>
            <div className="mt-2 text-[6px] font-bold text-[#c8593a] tracking-widest">
              SKILLS
            </div>
            <div className="text-[5px] text-zinc-300 mt-0.5 space-y-0.5 w-full">
              {skillsList(form)
                .slice(0, 5)
                .map((s, i) => (
                  <div key={i} className="truncate">
                    • {s}
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
      <div className="flex-1 p-3 space-y-2.5">
        <div>
          <div className="text-[8px] font-bold text-[#0a0a0a] tracking-tight">
            SUMMARY
          </div>
          <div className="h-0.5 w-3 bg-[#c8593a] mt-0.5 mb-1.5" />
          <PlaceholderBlock />
        </div>
        <div>
          <div className="text-[8px] font-bold text-[#0a0a0a] tracking-tight">
            EXPERIENCE
          </div>
          <div className="h-0.5 w-3 bg-[#c8593a] mt-0.5 mb-1.5" />
          <PlaceholderBlock />
          <div className="mt-1">
            <PlaceholderBlock widths={["80%", "70%"]} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────── Executive Template Preview (premium navy) ───────
function ExecutivePreview({ form }) {
  const skills = skillsList(form);
  return (
    <div className="h-full flex bg-white">
      <div className="w-[36%] bg-[#0d3b66] text-white py-3 px-2 flex flex-col items-center text-center">
        {form.photo ? (
          <div className="relative mb-2">
            <div className="absolute inset-0 -m-1 rounded-full border-2 border-[#4682c8]" />
            <img
              src={form.photo}
              alt=""
              className="relative h-10 w-10 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-white/10 mb-2 flex items-center justify-center text-white text-xs">
            👤
          </div>
        )}
        <div className="text-[8px] font-bold tracking-wide truncate w-full">
          {(form.name || "Your name").toUpperCase()}
        </div>
        <div className="text-[6px] text-[#a4c2e8] mt-0.5 tracking-wide truncate w-full">
          {(form.jobTitle || "Job title").toUpperCase()}
        </div>
        {(form.phone || form.email) && (
          <>
            <div className="mt-3 self-start text-[6px] font-bold tracking-widest">
              CONTACT
            </div>
            <div className="self-start text-[5px] text-zinc-200 mt-0.5 truncate w-full">
              {form.phone}
            </div>
            <div className="self-start text-[5px] text-zinc-200 truncate w-full">
              {form.email}
            </div>
          </>
        )}
        {form.education && (
          <>
            <div className="mt-2.5 self-start text-[6px] font-bold tracking-widest">
              EDUCATION
            </div>
            <div className="self-start text-[5px] text-zinc-200 mt-0.5 line-clamp-2 w-full text-left">
              {form.education}
            </div>
          </>
        )}
      </div>
      <div className="flex-1 relative p-3 pl-6">
        {/* Timeline */}
        <div className="absolute left-3.5 top-3 bottom-3 w-px bg-zinc-200" />
        {[1, 2, 3, 4].map((n, i) => (
          <div
            key={n}
            className="absolute h-3 w-3 -left-0 rounded-full bg-[#0d3b66] flex items-center justify-center text-white text-[5px] font-bold"
            style={{ top: `${10 + i * 27}%` }}
          >
            {n}
          </div>
        ))}
        <div className="space-y-3">
          <div>
            <div className="text-[7px] font-bold text-[#0d3b66] tracking-wide">
              EDUCATION
            </div>
            <PlaceholderBlock widths={["80%", "60%"]} />
          </div>
          <div>
            <div className="text-[7px] font-bold text-[#0d3b66] tracking-wide">
              EXPERIENCE
            </div>
            <PlaceholderBlock />
          </div>
          {skills.length > 0 && (
            <div>
              <div className="text-[7px] font-bold text-[#0d3b66] tracking-wide mb-1">
                SKILLS
              </div>
              {skills.slice(0, 4).map((s, i) => {
                const w = Math.max(40, 100 - i * 12);
                return (
                  <div key={i} className="flex items-center gap-1 mb-0.5">
                    <span className="text-[5px] text-zinc-700 w-1/3 truncate text-right">
                      {s}
                    </span>
                    <span
                      className="h-1 bg-[#0d3b66] rounded-sm"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <div>
            <div className="text-[7px] font-bold text-[#0d3b66] tracking-wide">
              CLUBS
            </div>
            <PlaceholderBlock widths={["75%", "55%"]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, accent, line, children }) {
  return (
    <div>
      <div className={`text-[7px] font-bold ${accent} tracking-wider`}>
        {title}
      </div>
      {line && <div className="h-px bg-current opacity-30 mt-0.5 mb-1.5" />}
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CenterSection({ title, accent, children }) {
  return (
    <div>
      <div
        className={`text-[7px] font-bold ${accent} tracking-[0.2em] text-center`}
        style={{ fontFamily: "Georgia, serif" }}
      >
        {title}
      </div>
      <div className="h-px w-6 bg-[#1a2845] mx-auto mt-0.5 mb-1.5" />
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

const RENDERERS = {
  modern: ModernPreview,
  classic: ClassicPreview,
  creative: CreativePreview,
  executive: ExecutivePreview,
};

export default function LiveTemplatePreview({ form, className = "" }) {
  if (!form) return null;
  const Tpl = RENDERERS[form.template] || ExecutivePreview;
  return (
    <div
      className={`relative aspect-[210/297] w-full bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] rounded-md overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 transition-all ${className}`}
    >
      <Tpl form={form} />
    </div>
  );
}
