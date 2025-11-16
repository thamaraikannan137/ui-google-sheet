import { Card } from '@mui/material';
import type { CardProps } from '@mui/material';

/**
 * Custom MUI Card wrapper with default props
 * Extends all MUI Card props
 */
export const MuiCard = (props: CardProps) => {
  return <Card elevation={2} {...props} />;
};

export default MuiCard;

