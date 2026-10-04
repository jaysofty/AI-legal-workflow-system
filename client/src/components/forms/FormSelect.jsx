function FormSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  getOptionLabel = (option) => option,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={id || name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.id || option} value={option.id || option}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FormSelect;