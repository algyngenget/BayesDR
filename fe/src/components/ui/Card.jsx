export function ClassificationCard({
  level,
  color,
  // bgColor,
  // borderColor,
  description,
  severity,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 transition-all duration-300 hover:-translate-y-1 hover:border-(--color-primary-light) hover:shadow-xl`}
    >
      {/* Background glow accent */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-current opacity-5 blur-xl transition-opacity group-hover:opacity-15"></div>

      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-md ${color}`}
        >
          {severity}
        </div>
        {/* <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${bgColor} ${borderColor} border`}>
          Level {severity}
        </span> */}
      </div>

      <h3 className="mb-2 text-base font-extrabold text-(--color-text-primary)">
        {level}
      </h3>
      <p className="text-xs leading-relaxed text-(--color-text-secondary)">
        {description}
      </p>
    </div>
  );
}

export function FeatureCard({ icon, title, description, badge }) {
  return (
    <div className="group bento-card relative overflow-hidden p-8">
      {badge && (
        <span className="mb-4 inline-flex items-center rounded-full border border-(--color-primary)/20 bg-(--color-primary-bg) px-3 py-1 text-xs font-bold text-(--color-primary-dark)">
          {badge}
        </span>
      )}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-(--color-border) bg-linear-to-br from-(--color-primary-bg) to-(--color-surface) text-2xl shadow-inner transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-extrabold text-(--color-text-primary)">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-(--color-text-secondary)">
        {description}
      </p>
    </div>
  );
}
