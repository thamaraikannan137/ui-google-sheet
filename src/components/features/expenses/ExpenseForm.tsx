import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MuiButton, MuiInput } from '../../common';
import { Box, MenuItem } from '@mui/material';
import type { ExpenseFormData } from '../../../types/models';

// Define validation schema
const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type ExpenseFormInputs = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Common expense categories
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Other',
];

export const ExpenseForm = ({ defaultValues, onSubmit, onCancel, isLoading }: ExpenseFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExpenseFormInputs>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues || {
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      description: '',
      amount: 0,
      category: '',
      notes: '',
    },
  });

  const handleFormSubmit = async (data: ExpenseFormInputs) => {
    await onSubmit(data as ExpenseFormData);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, mx: 'auto', p: 2 }}>
      <MuiInput
        {...register('date')}
        type="date"
        label="Date"
        InputLabelProps={{
          shrink: true,
        }}
        error={errors.date?.message}
      />

      <MuiInput
        {...register('description')}
        type="text"
        label="Description"
        placeholder="Enter expense description"
        error={errors.description?.message}
      />

      <MuiInput
        {...register('amount', { valueAsNumber: true })}
        type="number"
        label="Amount"
        placeholder="0.00"
        inputProps={{ step: '0.01', min: '0' }}
        error={errors.amount?.message}
      />

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <MuiInput
            {...field}
            select
            label="Category"
            error={errors.category?.message}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </MuiInput>
        )}
      />

      <MuiInput
        {...register('notes')}
        type="text"
        label="Notes (Optional)"
        placeholder="Additional notes..."
        multiline
        rows={3}
        error={errors.notes?.message}
      />

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

