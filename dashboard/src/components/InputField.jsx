export default function InputField({ 
  label, 
  type = "text", 
  icon: Icon, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  helperText,
  toggleButton,
  onToggle
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${toggleButton ? 'pr-12' : 'pr-4'} py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400`}
          required={required}
        />
        {toggleButton && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {toggleButton}
          </button>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
