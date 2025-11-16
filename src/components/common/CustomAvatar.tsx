import { forwardRef } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import { lighten, styled } from '@mui/material/styles';
import type { AvatarProps } from '@mui/material/Avatar';

// Theme color types
export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

export type CustomAvatarProps = AvatarProps & {
  color?: ThemeColor;
  skin?: 'filled' | 'light' | 'light-static';
  size?: number;
};

const Avatar = styled(MuiAvatar)<CustomAvatarProps>(({ theme, skin, color, size }) => {
  return {
    // Light skin with opacity
    ...(color &&
      skin === 'light' && {
        backgroundColor: lighten(theme.palette[color].main, 0.88),
        color: theme.palette[color].main,
      }),
    // Light static skin
    ...(color &&
      skin === 'light-static' && {
        backgroundColor: lighten(theme.palette[color].main, 0.84),
        color: theme.palette[color].main,
      }),
    // Filled skin (default)
    ...(color &&
      skin === 'filled' && {
        backgroundColor: theme.palette[color].main,
        color: theme.palette[color].contrastText,
      }),
    // Custom size
    ...(size && {
      height: size,
      width: size,
      fontSize: size ? size * 0.45 : undefined, // Proportional font size
    }),
  };
});

const CustomAvatar = forwardRef<HTMLDivElement, CustomAvatarProps>(
  (props: CustomAvatarProps, ref) => {
    const { color, skin = 'filled', size, ...rest } = props;

    return <Avatar color={color} skin={skin} size={size} ref={ref} {...rest} />;
  }
);

CustomAvatar.displayName = 'CustomAvatar';

export default CustomAvatar;

