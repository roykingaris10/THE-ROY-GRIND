import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TextInput,
  TextInputProps,
  Keyboard,
} from 'react-native';

interface DebouncedInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onDebouncedChange: (text: string) => void;
  delay?: number;
}

export function DebouncedInput({
  value: externalValue,
  onDebouncedChange,
  delay = 400,
  onBlur,
  ...rest
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(externalValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  const handleChange = useCallback(
    (text: string) => {
      setLocalValue(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onDebouncedChange(text);
      }, delay);
    },
    [onDebouncedChange, delay],
  );

  const handleBlur = useCallback(
    (e: any) => {
      isFocused.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onDebouncedChange(localValue);
      onBlur?.(e);
    },
    [localValue, onDebouncedChange, onBlur],
  );

  const handleFocus = useCallback(() => {
    isFocused.current = true;
  }, []);

  return (
    <TextInput
      {...rest}
      value={localValue}
      onChangeText={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      returnKeyType={rest.returnKeyType ?? 'done'}
      onSubmitEditing={rest.onSubmitEditing ?? (() => Keyboard.dismiss())}
    />
  );
}
