import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MuiButton, MuiInput } from '../common';

// Define validation schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old').max(100, 'Invalid age'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  role: z.enum(['user', 'admin', 'moderator']).refine((val) => val !== undefined, {
    message: 'Please select a role',
  }),
});

type UserFormInputs = z.infer<typeof userSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormInputs>;
  onSubmit: (data: UserFormInputs) => Promise<void>;
}

export const UserForm = ({ defaultValues, onSubmit }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      age: 18,
      bio: '',
      role: 'user',
    },
  });

  const handleFormSubmit = async (data: UserFormInputs) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">User Form</h2>

      <MuiInput
        {...register('name')}
        type="text"
        label="Name"
        placeholder="Enter name"
        error={errors.name?.message}
      />

      <MuiInput
        {...register('email')}
        type="email"
        label="Email"
        placeholder="Enter email"
        error={errors.email?.message}
      />

      <MuiInput
        {...register('age', { valueAsNumber: true })}
        type="number"
        label="Age"
        placeholder="Enter age"
        error={errors.age?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          {...register('bio')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Tell us about yourself..."
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          )}
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <MuiButton
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Submit
      </MuiButton>
    </form>
  );
};

