function FormTextArea({
  id,
  name,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  required = false,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

export default FormTextArea;
