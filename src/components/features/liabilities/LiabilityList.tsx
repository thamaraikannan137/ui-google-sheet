import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Typography, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Liability } from '../../../types/models';

interface LiabilityListProps {
  liabilities: Liability[];
  loading?: boolean;
  onEdit?: (liability: Liability) => void;
  onDelete?: (row: number) => void;
  onView?: (liability: Liability) => void;
}

export const LiabilityList = ({ liabilities, loading, onEdit, onDelete, onView }: LiabilityListProps) => {
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

  if (liabilities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No liabilities found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add your first liability to get started
        </Typography>
      </Box>
    );
  }

  // Get all unique column names from all liabilities (dynamic columns from Google Sheet)
  const getAllColumns = () => {
    const columnSet = new Set<string>();
    liabilities.forEach((liability) => {
      Object.keys(liability).forEach((key) => {
        if (key !== 'row') {
          columnSet.add(key);
        }
      });
    });
    return Array.from(columnSet);
  };

  const columns = getAllColumns();

  // Helper to check if a value looks like a date
  const isDateValue = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    // Check for common date patterns
    return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value);
  };

  // Helper to check if a value looks like a number/amount
  const isAmountValue = (value: any): boolean => {
    if (value === '' || value === null || value === undefined) return false;
    const str = String(value);
    // Check if it's a number (with optional commas, decimals, currency symbols)
    return /^[\d,]+\.?\d*$/.test(str.replace(/[$,]/g, ''));
  };

  // Helper to get cell value with formatting
  const getCellValue = (liability: Liability, column: string) => {
    const value = liability[column];
    if (value === '' || value === null || value === undefined) return '-';
    
    // Format dates
    if (isDateValue(value)) {
      return formatDate(String(value));
    }
    
    // Format amounts
    if (isAmountValue(value)) {
      return formatAmount(value);
    }
    
    return String(value);
  };

  if (columns.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No columns found in data
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col} sx={{ fontWeight: 'bold' }}>
                {col}
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {liabilities.map((liability, index) => (
            <TableRow 
              key={liability.row || index} 
              hover
              onClick={() => onView && onView(liability)}
              sx={{ 
                cursor: onView ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: onView ? 'action.hover' : 'inherit',
                }
              }}
            >
              {columns.map((column) => {
                const value = liability[column];
                const cellValue = getCellValue(liability, column);
                const isAmount = isAmountValue(value);
                
                return (
                  <TableCell key={column}>
                    {isAmount ? (
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {cellValue}
                      </Typography>
                    ) : isDateValue(value) ? (
                      <Typography variant="body2">
                        {cellValue}
                      </Typography>
                    ) : (
                      cellValue
                    )}
                  </TableCell>
                );
              })}
              {(onEdit || onDelete) && (
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {onEdit && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(liability);
                        }}
                        aria-label="edit liability"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDelete && liability.row && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(liability.row!);
                        }}
                        aria-label="delete liability"
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

