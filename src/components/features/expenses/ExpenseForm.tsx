import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { MuiButton, MuiInput } from '../../common';
import { Box } from '@mui/material';
import type { Expense, ExpenseFormData } from '../../../types/models';

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormData> | Expense | Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  columns?: string[]; // Dynamic columns from Google Sheet
}

// Helper to convert date format to YYYY-MM-DD for HTML date input
const convertToDateInputFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr;
  }
  
  // Handle DD.MM.YYYY format (e.g., "20.04.2025")
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month}-${day}`;
  }
  
  // Handle DD/MM/YYYY format
  const ddmmyyyySlashMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (ddmmyyyySlashMatch) {
    const [, day, month, year] = ddmmyyyySlashMatch;
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse as Date and convert
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Ignore parsing errors
  }
  
  return dateStr;
};

// Helper to detect field type based on column name and value
const getFieldType = (columnName: string, value: unknown): 'date' | 'number' | 'text' => {
  const lowerName = columnName.toLowerCase();
  
  // Check if it's a date field
  if (lowerName.includes('date') || 
      (typeof value === 'string' && (
        /^\d{4}-\d{2}-\d{2}/.test(value) || 
        /^\d{2}\.\d{2}\.\d{4}/.test(value) ||
        /^\d{2}\/\d{2}\/\d{4}/.test(value)
      ))) {
    return 'date';
  }
  
  // Check if it's a number field
  if (lowerName.includes('amount') || lowerName.includes('price') || lowerName.includes('cost') || 
      lowerName.includes('total') || lowerName.includes('withdrawn') || lowerName.includes('paid') ||
      lowerName.includes('given') || lowerName.includes('contributed') ||
      (typeof value === 'string' && /^[\d,]+\.?\d*$/.test(value.replace(/[$,]/g, '')))) {
    return 'number';
  }
  
  return 'text';
};

export const ExpenseForm = ({ defaultValues, onSubmit, onCancel, isLoading, columns }: ExpenseFormProps) => {
  // Get columns from props or extract from defaultValues
  const formColumns = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns.filter(col => col !== 'row');
    }
    if (defaultValues) {
      return Object.keys(defaultValues).filter(key => key !== 'row');
    }
    // Default columns if none provided
    return ['date', 'description', 'amount', 'category', 'notes'];
  }, [columns, defaultValues]);

  // Create default values object with all columns
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    formColumns.forEach(col => {
      if (defaultValues && typeof defaultValues === 'object' && col in defaultValues) {
        const rawValue = (defaultValues as Record<string, unknown>)[col];
        const fieldType = getFieldType(col, rawValue);
        
        // Convert date values to YYYY-MM-DD format for HTML date input
        if (fieldType === 'date' && typeof rawValue === 'string') {
          values[col] = convertToDateInputFormat(rawValue);
        } 
        // Convert number values - remove commas and parse
        else if (fieldType === 'number' && rawValue !== null && rawValue !== undefined && rawValue !== '') {
          if (typeof rawValue === 'string') {
            const numValue = parseFloat(rawValue.replace(/[$,]/g, ''));
            values[col] = isNaN(numValue) ? 0 : numValue;
          } else {
            values[col] = rawValue;
          }
        } 
        // Keep text values as-is
        else {
          values[col] = rawValue || '';
        }
      } else {
        // Set default based on field type
        const fieldType = getFieldType(col, '');
        if (fieldType === 'date') {
          values[col] = new Date().toISOString().split('T')[0];
        } else if (fieldType === 'number') {
          values[col] = 0;
        } else {
          values[col] = '';
        }
      }
    });
    return values;
  }, [formColumns, defaultValues]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<Record<string, unknown>>({
    defaultValues: initialValues,
  });

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    // Reset form with new values
    reset(initialValues);
    
    // Also set values individually to ensure they're updated
    formColumns.forEach(col => {
      if (initialValues[col] !== undefined) {
        setValue(col, initialValues[col], { shouldValidate: false });
      }
    });
  }, [defaultValues, reset, initialValues, formColumns, setValue]);

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    await onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, mx: 'auto', p: 2 }}>
      {formColumns.map((column) => {
        const value = defaultValues && typeof defaultValues === 'object' && column in defaultValues
          ? (defaultValues as Record<string, unknown>)[column]
          : undefined;
        const fieldType = getFieldType(column, value);
        const isDate = fieldType === 'date';
        const isNumber = fieldType === 'number';
        
        return (
          <MuiInput
            key={column}
            {...register(column, {
              valueAsNumber: isNumber,
              required: `${column} is required`,
            })}
            type={isDate ? 'date' : isNumber ? 'number' : 'text'}
            label={column}
            placeholder={`Enter ${column}`}
            InputLabelProps={isDate ? { shrink: true } : undefined}
            inputProps={isNumber ? { step: '0.01', min: '0' } : undefined}
            multiline={!isDate && !isNumber && column.toLowerCase().includes('note')}
            rows={!isDate && !isNumber && column.toLowerCase().includes('note') ? 3 : undefined}
            error={!!errors[column]}
            helperText={errors[column]?.message as string}
          />
        );
      })}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {onCancel && (
          <MuiButton
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </MuiButton>
        )}
        <MuiButton
          type="submit"
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
        >
          {defaultValues ? 'Update Expense' : 'Add Expense'}
        </MuiButton>
      </Box>
    </Box>
  );
};

