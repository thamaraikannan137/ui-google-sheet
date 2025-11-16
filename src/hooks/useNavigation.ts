// React Imports
import { useState, useCallback, useEffect } from 'react';

export const useNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBreakpointReached, setIsBreakpointReached] = useState(false);
  const [isPinned, setIsPinned] = useState(true);

  const handleBreakpointChange = useCallback(() => {
    const isLgScreen = window.matchMedia('(min-width: 1200px)').matches;
    setIsBreakpointReached(!isLgScreen);
    
    if (!isLgScreen) {
      setIsCollapsed(false);
    }
  }, []);

  useEffect(() => {
    handleBreakpointChange();
    window.addEventListener('resize', handleBreakpointChange);

    return () => {
      window.removeEventListener('resize', handleBreakpointChange);
    };
  }, [handleBreakpointChange]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const togglePin = useCallback(() => {
    setIsPinned(prev => !prev);
    setIsCollapsed(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isCollapsed && !isPinned) {
      setIsHovered(true);
    }
  }, [isCollapsed, isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (isCollapsed && !isPinned) {
      setIsHovered(false);
    }
  }, [isCollapsed, isPinned]);

  return {
    isCollapsed,
    isHovered,
    isBreakpointReached,
    isPinned,
    toggleCollapse,
    togglePin,
    handleMouseEnter,
    handleMouseLeave,
    setIsCollapsed
  };
};

