import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';

// Styles
import './NavSearch.css';

// Data
import searchData from '../../data/searchData';
import type { SearchItem } from '../../data/searchData';

type Section = {
  title: string;
  items: SearchItem[];
};

// Transform data to group by sections
const transformedData = searchData.reduce((acc: Section[], item) => {
  const existingSection = acc.find((section) => section.title === item.section);

  if (existingSection) {
    existingSection.items.push(item);
  } else {
    acc.push({ title: item.section, items: [item] });
  }

  return acc;
}, []);

// Filter and limit results
const getFilteredResults = (sections: Section[], query: string) => {
  const searchQuery = query.trim().toLowerCase();

  if (!searchQuery) return [];

  const filtered = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery) ||
          item.section.toLowerCase().includes(searchQuery) ||
          (item.shortcut && item.shortcut.toLowerCase().includes(searchQuery))
      ),
    }))
    .filter((section) => section.items.length > 0);

  // Limit items per section
  const limit = filtered.length > 1 ? 3 : 5;

  return filtered.map((section) => ({
    ...section,
    items: section.items.slice(0, limit),
  }));
};

const NavSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredData = useMemo(
    () => getFilteredResults(transformedData, searchValue),
    [searchValue]
  );

  // Handle item selection
  const onSelect = (item: SearchItem) => {
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank');
    } else {
      navigate(item.url);
    }
    setOpen(false);
    setSearchValue('');
  };

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset search when closed
  useEffect(() => {
    if (!open && searchValue) {
      setSearchValue('');
    }
  }, [open, searchValue]);

  return (
    <>
      {/* Search Trigger Button */}
      {isMobile ? (
        <IconButton onClick={() => setOpen(true)} color="inherit">
          <SearchIcon />
        </IconButton>
      ) : (
        <Box
          onClick={() => setOpen(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            columnGap: 1.25,
            cursor: 'pointer',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            // Wider on desktop, auto on mobile
            minWidth: { sm: 260, md: 340 },
            width: { sm: 260, md: 340 },
            flexShrink: 0,
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <SearchIcon fontSize="small" />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ userSelect: 'none', ml: 0.5, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            Search
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 0.75,
              py: 0.25,
              bgcolor: 'action.selected',
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              ml: 'auto',
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            ⌘K
          </Typography>
        </Box>
      )}

      {/* Command Dialog */}
      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
      >
        <Command
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {/* Search Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <SearchIcon color="action" />
            <CommandInput
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder="Search pages, features..."
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '1rem',
                color: theme.palette.text.primary,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              [esc]
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Results */}
          <CommandList 
            style={{ 
              maxHeight: isMobile ? 'none' : '70vh', 
              minHeight: isMobile ? 'auto' : '400px',
              padding: '8px',
              overflowY: 'auto',
              flex: isMobile ? 1 : undefined,
            }}
          >
            {searchValue ? (
              filteredData.length > 0 ? (
                filteredData.map((section, idx) => (
                  <CommandGroup
                    key={idx}
                    heading={section.title}
                    style={{
                      marginBottom: '8px',
                    }}
                  >
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.url;

                      return (
                        <CommandItem
                          key={item.id}
                          value={`${item.name} ${section.title} ${item.shortcut || ''}`}
                          onSelect={() => onSelect(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          }}
                        >
                          <i className={item.icon} style={{ fontSize: '1.25rem' }} />
                          <span style={{ flex: 1 }}>{item.name}</span>
                          {item.shortcut && (
                            <Typography
                              variant="caption"
                              sx={{
                                px: 0.75,
                                py: 0.25,
                                bgcolor: 'action.selected',
                                borderRadius: 0.5,
                                fontFamily: 'monospace',
                              }}
                            >
                              {item.shortcut}
                            </Typography>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))
              ) : (
                <CommandEmpty>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No results found for "{searchValue}"
                    </Typography>
                  </Box>
                </CommandEmpty>
              )
            ) : (
              // Default suggestions when no search
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  QUICK ACCESS
                </Typography>
                {transformedData[0]?.items.slice(0, 5).map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => onSelect(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      marginBottom: '4px',
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: '1.25rem' }} />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </Box>
            )}
          </CommandList>

          {/* Footer with keyboard hints */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: 2,
                py: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                fontSize: '0.75rem',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <KeyboardArrowUpIcon fontSize="small" />
                <KeyboardArrowDownIcon fontSize="small" />
                <Typography variant="caption">to navigate</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <KeyboardReturnIcon fontSize="small" />
                <Typography variant="caption">to select</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption">esc to close</Typography>
              </Box>
            </Box>
          )}
        </Command>
      </CommandDialog>
    </>
  );
};

export default NavSearch;

