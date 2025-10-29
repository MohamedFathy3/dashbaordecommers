import { useState, useEffect } from "react";

interface SelectFieldProps {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (val: any) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalQueries?: any;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  field,
  value,
  onChange,
  additionalQueries,
}) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [field.optionsKey, additionalQueries]);

  const loadOptions = async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadedOptions: any[] = [];

    if (field.options) {
      loadedOptions = field.options;
    } else if (field.optionsKey && additionalQueries) {
      setLoading(true);
      try {
        const queryData =
          (additionalQueries as Record<string, { data?: unknown[] }>)?.[
            field.optionsKey
          ]?.data;

        if (Array.isArray(queryData)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
          loadedOptions = queryData.map((opt: any) => ({
            value: opt.id?.toString(),
            label: opt.name || opt.title || opt.label || `Item ${opt.id}`,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    setOptions(loadedOptions);

    if (value && !loadedOptions.find((opt) => opt.value === value?.toString())) {
      setOptions((prev) => [
        ...prev,
        { value: value?.toString(), label: `Current: ${value}` },
      ]);
    }
  };

  const getCurrentValueLabel = () => {
    if (!value) return "";
    const currentOption = options.find(
      (opt) => opt.value === value?.toString()
    );
    return currentOption?.label || value;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {loading ? (
        <div className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-500">Loading options...</span>
          </div>
        </div>
      ) : (
        <>
          <select
            name={field.name}
            value={value?.toString() || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 rounded-xl dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required={field.required}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {value && (
            <div className="mt-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
              <strong>Current Value:</strong> {getCurrentValueLabel()}
            </div>
          )}
        </>
      )}
    </div>
  );
};
