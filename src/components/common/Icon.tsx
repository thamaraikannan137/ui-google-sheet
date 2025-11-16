import { forwardRef, type ComponentPropsWithoutRef } from 'react';

interface IconProps extends ComponentPropsWithoutRef<'i'> {
  icon: string; // e.g., "ri-dashboard-line"
  className?: string;
}

/**
 * Icon component that renders Iconify icons from CSS bundle
 * Usage: <Icon icon="ri-dashboard-line" />
 */
const Icon = forwardRef<HTMLElement, IconProps>(
  ({ icon, className = '', ...props }, ref) => {
    // Convert "ri-dashboard-line" to "icon-ri-dashboard-line"
    const iconClass = `icon-${icon} ${className}`.trim();

    return <i ref={ref} className={iconClass} {...props} />;
  }
);

Icon.displayName = 'Icon';

export default Icon;


