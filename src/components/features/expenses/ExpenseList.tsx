import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Typography, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Expense } from '../../../types/models';

interface ExpenseListProps {
  expenses: Expense[];
  loading?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (row: number) => void;
}

export const ExpenseList = ({ expenses, loading, onEdit, onDelete }: ExpenseListProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount?: number | string) => {
    if (amount === undefined || amount === null) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (expenses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No expenses found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add your first expense to get started
        </Typography>
      </Box>
    );
  }

  // Get headers from first expense (assuming all expenses have same structure)
  const headers = Object.keys(expenses[0] || {}).filter(
    (key) => key !== 'row' && expenses[0][key] !== undefined
  );

  // Standard columns we want to show first
  const standardColumns = ['date', 'description', 'amount', 'category'];
  const otherColumns = headers.filter((h) => !standardColumns.includes(h));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {standardColumns.map((col) => (
              <TableCell key={col} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                {col}
              </TableCell>
            ))}
            {otherColumns.length > 0 && (
              <TableCell sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                Additional Info
              </TableCell>
            )}
            {(onEdit || onDelete) && (
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense, index) => (
            <TableRow key={expense.row || index} hover>
              <TableCell>
                {expense.date ? formatDate(expense.date) : '-'}
              </TableCell>
              <TableCell>{expense.description || '-'}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {formatAmount(expense.amount)}
                </Typography>
              </TableCell>
              <TableCell>
                {expense.category ? (
                  <Chip label={expense.category} size="small" color="primary" variant="outlined" />
                ) : (
                  '-'
                )}
              </TableCell>
              {otherColumns.length > 0 && (
                <TableCell>
                  {expense.notes ? (
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                      {expense.notes}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
              )}
              {(onEdit || onDelete) && (
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {onEdit && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(expense)}
                        aria-label="edit expense"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDelete && expense.row && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(expense.row!)}
                        aria-label="delete expense"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

