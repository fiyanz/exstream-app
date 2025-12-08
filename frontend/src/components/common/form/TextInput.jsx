
import { AlertCircle } from 'lucide-react';

const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
  icon: Icon,
  className = "",
  helperText,
}) => (
  <div className={`flex flex-col ${className}`}>
    {label && (
      <label
        htmlFor={name}
        className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Icon className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400 group-focus-within:text-blue-600'} transition-colors duration-200`} aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          block w-full h-12
          ${Icon ? 'pl-14' : 'pl-4'} pr-4
          border rounded-xl shadow-sm 
          text-sm font-medium text-gray-900 placeholder-gray-400
          bg-white
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50/50' 
            : 'border-gray-200 hover:border-gray-400'
          }
        `}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
      />
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
      )}
    </div>
    {error ? (
      <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1" id={`${name}-error`}>
        <span>&bull;</span> {error}
      </p>
    ) : helperText ? (
      <p className="mt-1.5 text-xs text-gray-500" id={`${name}-helper`}>
        {helperText}
      </p>
    ) : null}
  </div>
);

export default TextInput;
