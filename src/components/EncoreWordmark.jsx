export default function EncoreWordmark({
  amazonTextClassName = 'text-white font-bold text-[1.7rem] tracking-tight',
  encoreTextClassName = 'font-bold text-[1.7rem] tracking-tight',
  textColor = '#FFFFFF',
  encoreColor = '#FF9900',
  subLabel,
  subLabelClassName = 'text-[11px] tracking-[0.18em] uppercase',
  subLabelColor = '#A7B0B6',
}) {
  return (
    <div className="flex flex-col leading-none min-w-fit">
      <div className="flex items-end gap-1">
        <span className={amazonTextClassName} style={{ color: textColor }}>
          amazon
        </span>
        <span style={{ color: encoreColor }} className={encoreTextClassName}>
          encore
        </span>
      </div>
      {subLabel && (
        <span className={subLabelClassName} style={{ color: subLabelColor }}>
          {subLabel}
        </span>
      )}
    </div>
  )
}
