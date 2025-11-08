import React from "react";

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  className = "",
  ...rest
}) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...rest}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default Input;
