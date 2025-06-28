
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getValidationError, formatPhoneNumber } from "@/utils/validation";

interface ValidatedInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  validationType?: 'phone' | 'email' | 'name';
  required?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  showError?: boolean;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, validationType, required = false, onValidationChange, showError = true, className, onChange, ...props }, ref) => {
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    const validateInput = useCallback((value: string) => {
      if (!validationType) return null;
      
      if (required && !value.trim()) {
        return `${label} is required`;
      }
      
      if (value.trim()) {
        return getValidationError(validationType, value);
      }
      
      return null;
    }, [validationType, required, label]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Format phone number input
      if (validationType === 'phone') {
        value = formatPhoneNumber(value);
        e.target.value = value;
      }
      
      const validationError = validateInput(value);
      setError(validationError);
      
      if (onValidationChange) {
        onValidationChange(!validationError);
      }
      
      if (onChange) {
        onChange(e);
      }
    }, [validateInput, onValidationChange, onChange, validationType]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      const validationError = validateInput(e.target.value);
      setError(validationError);
      
      if (onValidationChange) {
        onValidationChange(!validationError);
      }
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    }, [validateInput, onValidationChange, props]);

    const hasError = touched && error && showError;

    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className={cn(hasError && "text-destructive")}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          {...props}
          ref={ref}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            hasError && "border-destructive focus-visible:ring-destructive",
            className
          )}
          maxLength={validationType === 'phone' ? 10 : undefined}
        />
        {hasError && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";
