'use client';

import React, { memo, useCallback, useState, useEffect } from "react";
import { Eye, EyeClosed } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import {
  Input,
  Checkbox,
  InputNumber,
  DatePicker,
  ConfigProvider,
} from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import dayjs from "dayjs";
import {
  defaultConditions,
  getSchemaByType,
} from "@/lib/schemas/formSchemas";
import { ChangeInput } from "@/lib/Hooks/useFormData";


// ==================== TYPES ====================

type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'phone'
  | 'url'
  | 'textarea'
  | 'checkbox'
  | 'datetime-local'
  | 'file'
  | 'select'
  | 'multi-select';

interface ValidationConditions {
  text?: { min?: number; max?: number; message?: string };
  password?: {
    min?: number;
    requireUppercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
    message?: string
  };
  email?: { message?: string };
  number?: { min?: number; max?: number; message?: string };
  url?: { message?: string };
  textarea?: { min?: number; max?: number; message?: string };
  checkbox?: { message?: string };
  'datetime-local'?: { message?: string };
}

interface InputFieldProps {
  /** Unique identifier for the field */
  id: string;
  /** Label text for the field */
  label?: string;
  /** Input type */
  type?: InputType;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Current field value */
  value?: ChangeInput;
  /** Change handler - compatible with useFormData */
  onChange: (e: ChangeInput) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Use unstyled input */
  unstyled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Use fieldset wrapper */
  withFieldset?: boolean;
  /** Enable validation */
  validate?: boolean;
  /** Error handler callback */
  handleAddError?: (id: string, error: string) => void;
  /** Form errors object */
  formErrors?: Record<string, string>;
  /** Validation conditions */
  conditions?: ValidationConditions;
  /** Show errors only after form submission */
  isSubmited?: boolean;
  /** Alias for isSubmited */
  showErrorMessage?: boolean;
  /** Min value for number inputs */
  min?: number;
  /** Max value for number inputs */
  max?: number;
  /** Rows for textarea */
  rows?: number;
  /** Autocomplete attribute */
  autoComplete?: string;
  onSubmit?: boolean;
  /** Explicit error message */
  error?: string;
  /** Allow selecting past dates for datetime-local */
  isPassDate?: boolean;
  /** Allow selecting future dates for datetime-local (defaults to true) */
  isFeatureDate?: boolean;
}

// ==================== COMPONENT ====================

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = "text",
  required = false,
  className = "",
  value,
  onChange,
  disabled = false,
  unstyled = false,
  placeholder = "",
  withFieldset = false,
  validate = false,
  handleAddError,
  formErrors = {},
  conditions = {},
  isSubmited = false,
  showErrorMessage = false,
  min,
  max,
  rows = 4,
  autoComplete,
  onSubmit = false,
  error,
  isPassDate = false,
  isFeatureDate = true,
}) => {
  const [currentType, setCurrentType] = useState<string>(type);

  // Combine both props - show errors if either is true
  const shouldShowErrors = isSubmited || showErrorMessage;

  // Type checks
  const isCheckbox = type === "checkbox";
  const isTextarea = type === "textarea";
  const isPhoneNumber = type === "phone" || type === "tel";
  const isPassword = type === "password";
  const isDateTimeLocal = type === "datetime-local";
  const isNumber = type === "number";
  const isSelect = type === "select" || type === "multi-select";
  const isFile = type === "file";

  // Merge conditions
  const mergedConditions = { ...defaultConditions, ...conditions };
  const activeConds = mergedConditions[type as keyof ValidationConditions] || mergedConditions.text || { min: 1 };

  // Validation
  const runValidation = useCallback(
    (fieldValue: string | number | boolean | null) => {
      if (!handleAddError) return;

      // Check required first
      const isEmpty = fieldValue === "" || fieldValue === null || fieldValue === undefined;
      if (required && isEmpty) {
        handleAddError(id, "This field is required");
        return;
      }

      // Skip schema validation if not enabled or value is empty
      if (!validate || isEmpty) {
        handleAddError(id, "");
        return;
      }

      try {
        const schema = getSchemaByType(type, activeConds);
        const valueToValidate = isCheckbox
          ? !!fieldValue
          : type === "number"
            ? Number(fieldValue)
            : fieldValue;

        schema.parse(valueToValidate);
        handleAddError(id, "");
      } catch (err: unknown) {
        if (err) {
          try {
            const parsed = JSON.parse(String(err));
            handleAddError(id, parsed[0]?.message || "Invalid value");
          } catch {
            handleAddError(id, "Invalid value");
          }
        }
      }
    },
    [type, activeConds, required, validate, id, handleAddError, isCheckbox]
  );

  // Handle input changes
  const handleChangeData = useCallback((e: ChangeInput) => {
    if (isPhoneNumber && typeof e === 'string') {
      onChange(e);
      runValidation(e);
    } else if (isCheckbox && typeof e === 'boolean') {
      onChange(e);
      runValidation(e);
    } else {
      onChange(e);
      const val = (e && typeof e === 'object' && 'target' in (e as object))
        ? (e as React.ChangeEvent<HTMLInputElement>).target.value
        : e;

      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null) {
        runValidation(val);
      }
    }
  }, [isPhoneNumber, isCheckbox, onChange, runValidation]);

  useEffect(() => {
    if (!validate || !required || !onSubmit || !handleAddError)
      return

    if (!value) {
      handleAddError(id, "This field is required")
    } else {
      handleAddError(id, "")
    }
  }, [value, isSubmited, onSubmit, id, handleAddError, required, validate])

  // Error states
  const hasValidationError = validate && !!formErrors[id];
  const hasRequiredError = shouldShowErrors && required && !value && value !== 0;
  const hasError = hasValidationError || hasRequiredError;

  // Get error message
  const getErrorMessage = (): string | null => {
    if (error) return error;
    if (hasValidationError) return formErrors[id];
    if (hasRequiredError) return "This field is required";
    return null;
  };
  const getErrorMessageOnSubmit = (): string | null => {
    if (hasValidationError && isSubmited) return formErrors[id];
    if (hasRequiredError && isSubmited) return "This field is required";
    return null;
  };

  // Render error message
  const renderError = () => {
    const errorMessage = onSubmit ? getErrorMessageOnSubmit() : getErrorMessage();
    if (!errorMessage) return null;

    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-xs mt-1"
      >
        {errorMessage}
      </motion.p>
    );
  };

  // Styles
  const status = hasError ? "error" : undefined;

  // Render checkbox input
  const renderCheckbox = () => (
    <Checkbox
      id={id}
      checked={!!value}
      disabled={disabled}
      onChange={(e: CheckboxChangeEvent) => handleChangeData(e.target.checked)}
      className={className}
    >
      {label}
    </Checkbox>
  );

  // Render textarea
  const renderTextarea = () => (
    <Input.TextArea
      id={id}
      name={id}
      value={String(value || "")}
      onChange={handleChangeData}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      status={status}
      variant={unstyled || withFieldset ? "borderless" : "outlined"}
      className={className}
    />
  );



  // Render password input
  const renderPasswordInput = () => (
    <Input.Password
      id={id}
      name={id}
      value={String(value || "")}
      onChange={handleChangeData}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete || "current-password"}
      status={status}
      variant={unstyled || withFieldset ? "borderless" : "outlined"}
      className={className}
      iconRender={(visible) => (visible ? <Eye size={20} className="text-blueIcons" /> : <EyeClosed size={20} className="text-blueIcons" />)}
    />
  );

  // Render number input
  const renderNumberInput = () => (
    <InputNumber
      id={id}
      name={id}
      value={value as number}
      onChange={handleChangeData}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      className={`w-full ${className}`}
      status={status}
      variant={unstyled || withFieldset ? "borderless" : "outlined"}
    />
  );

  // Render date input
  const renderDateInput = () => (
    <DatePicker
      showTime={{ use12Hours: true, format: "h:mm a" }}
      format="YYYY-MM-DD h:mm a"
      id={id}
      className={`w-full min-w-0 text-sm ${className}`}
      value={
        (typeof value === "string" ||
          typeof value === "number" ||
          value instanceof Date)
          ? dayjs(value)
          : null
      }
      onChange={(date) => handleChangeData(date ? date.toISOString() : null)}
      disabled={disabled}
      status={status}
      variant={unstyled || withFieldset ? "borderless" : "outlined"}
      placeholder={placeholder}
      minDate={isPassDate ? undefined : dayjs()}
      getPopupContainer={() => document.body}
      popupClassName="responsive-datepicker"
      inputReadOnly
      maxDate={isFeatureDate ? undefined : dayjs()}
    />
  );

  // Render regular input
  const renderInput = () => (
    <Input
      id={id}
      name={id}
      type={type === "tel" ? "tel" : type === "url" ? "url" : type === "email" ? "email" : "text"}
      value={String(value ?? "")}
      onChange={handleChangeData}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      status={status}
      variant={unstyled || withFieldset ? "borderless" : "outlined"}
      className={className}
    />
  );

  // Render select input
  const renderSelect = () => (
    <Input
      id={id}
      name={id}
      value={String(value ?? "")}
      onChange={handleChangeData}
      placeholder={placeholder}
      disabled={disabled}
      status={status}
      variant={unstyled || withFieldset ? "borderless" : "outlined"}
      className={className}
    />
  );

  // Render file input
  const renderFile = () => (
    <input
      id={id}
      name={id}
      type="file"
      onChange={(e) => handleChangeData(e.target.files?.[0]?.name || "")}
      disabled={disabled}
      className={`w-full ${className}`}
      placeholder={placeholder}
    />
  );

  // Get the appropriate input element
  const getInputElement = () => {
    if (isCheckbox) return renderCheckbox();
    if (isTextarea) return renderTextarea();

    if (isPassword) return renderPasswordInput();
    if (isNumber) return renderNumberInput();
    if (isDateTimeLocal) return renderDateInput();
    if (isSelect) return renderSelect();
    if (isFile) return renderFile();
    return renderInput();
  };

  // With fieldset wrapper
  if (withFieldset && !isCheckbox) {
    return (
      <div className="flex flex-col w-full min-w-0">
        <fieldset
          className={`
            ${isPhoneNumber ? "py-[3px]" : "py-2 "} px-4 border rounded-lg transition-colors min-w-0
            ${onSubmit ? hasError && isSubmited ? "border-red-400" : "border-grayBorder" : hasError ? "border-red-400" : "border-grayBorder"}
            ${disabled ? "opacity-60 bg-gray-50" : "bg-white"}
          `}
        >
          <legend className="px-2 text-blueSite font-semibold text-sm">
            {label}
          </legend>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#00664F',
              },
              components: {
                Input: {
                  activeBorderColor: 'transparent',
                  hoverBorderColor: 'transparent',
                },
                InputNumber: {
                  activeBorderColor: 'transparent',
                  hoverBorderColor: 'transparent',
                },
                DatePicker: {
                  activeBorderColor: 'transparent',
                  hoverBorderColor: 'transparent',
                  colorPrimary: '#00664F',
                  colorPrimaryHover: '#00664F',
                  cellWidth: 32,
                  cellHeight: 32,
                  fontSize: 14,
                }
              }
            }}
          >
            {getInputElement()}
          </ConfigProvider>
        </fieldset>
        {renderError()}
      </div>
    );
  }

  // Checkbox layout
  if (isCheckbox) {
    return (
      <div className="flex items-center w-full gap-2">
        {renderCheckbox()}
        {renderError()}
      </div>
    );
  }

  // Default layout (no fieldset)
  return (
    <div className="flex flex-col w-full min-w-0">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-textGrayColor mb-1"
        >
          {label}
        </label>
      )}
      {getInputElement()}
      {renderError()}
    </div>
  );
};

export default memo(InputField);

