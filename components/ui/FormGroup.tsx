interface FormGroupProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function FormGroup({
  label,
  htmlFor,
  children,
  hint,
  className = '',
  style,
}: FormGroupProps) {
  return (
    <div className={`form-group ${className}`.trim()} style={style}>
      <label className="form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}
