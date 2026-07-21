const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required,
  error,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-bold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3.5 rounded-xl border text-base font-medium bg-white ${
            Icon ? "pl-12" : ""
          } ${
            error
              ? "border-red-400 focus:ring-red-200 bg-red-50"
              : "border-gray-200 focus:ring-indigo-100"
          } focus:border-indigo-500 focus:ring-4 outline-none transition shadow-sm`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default TextInput;
