import { useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { MuiButton, MuiInput } from '../../common';
import { Box, Typography, IconButton, LinearProgress, Alert } from '@mui/material';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import type { Liability, LiabilityFormData } from '../../../types/models';

interface LiabilityFormProps {
  defaultValues?: Partial<LiabilityFormData> | Liability | Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>, file?: File) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  columns?: string[]; // Dynamic columns from Google Sheet
  liabilityRow?: number; // Row number for file upload (required if editing)
  existingFileId?: string | null; // Existing file ID if editing
}

// Helper to convert date format to YYYY-MM-DD for HTML date input
const convertToDateInputFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr;
  }
  
  // Handle DD-MM-YYYY format (e.g., "17-11-2024")
  const ddmmyyyyHyphenMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (ddmmyyyyHyphenMatch) {
    const [, day, month, year] = ddmmyyyyHyphenMatch;
    return `${year}-${month}-${day}`;
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
        /^\d{2}-\d{2}-\d{4}/.test(value) ||  // DD-MM-YYYY format
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

export const LiabilityForm = ({ 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isLoading, 
  columns,
  liabilityRow,
  existingFileId 
}: LiabilityFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    // Pass file only if one is selected
    await onSubmit(data, selectedFile || undefined);
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

      {/* File Upload Section */}
      <Box sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Attachment (Optional)
        </Typography>
        
        {existingFileId && !selectedFile && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Current file attached. Upload a new file to replace it.
            </Typography>
          </Alert>
        )}

        {filePreview && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img 
              src={filePreview} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
            />
          </Box>
        )}

        {selectedFile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <AttachFileIcon fontSize="small" />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </Typography>
            <IconButton size="small" onClick={handleRemoveFile} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input">
          <MuiButton
            component="span"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={isSubmitting || isLoading || uploading}
            sx={{ width: '100%' }}
          >
            {selectedFile ? 'Change File' : existingFileId ? 'Replace File' : 'Choose File'}
          </MuiButton>
        </label>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Supported: Images, PDF, Word, Excel (Max 10MB)
        </Typography>
      </Box>

      {uploading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Uploading file...
          </Typography>
        </Box>
      )}

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
          {defaultValues ? 'Update Liability' : 'Add Liability'}
        </MuiButton>
      </Box>
    </Box>
  );
};

