/**
 * Iconify Icon Bundle Generator
 * 
 * Generates CSS bundle from Iconify icon sets for optimized loading.
 * Run with: npm run build:icons
 */

import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import { getIcons, getIconsCSS } from '@iconify/utils';
import type { IconifyJSON } from '@iconify/types';

const require = createRequire(import.meta.url);

async function generateIconsCSS() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Collect all RemixIcon icons used in the project
  const usedRemixIcons = [
    // Navigation icons
    'ri-dashboard-line',
    'ri-home-line',
    'ri-info-line',
    'ri-calculator-line',
    'ri-palette-line',
    'ri-login-box-line',
    'ri-user-add-line',
    'ri-settings-3-line',
    
    // Search icons
    'ri-information-line',
    'ri-github-line',
    'ri-book-open-line',
    'ri-user-line',
    'ri-shopping-bag-line',
    'ri-bar-chart-line',
    'ri-file-chart-line',
    'ri-message-3-line',
    'ri-notification-line',
    'ri-question-line',
    'ri-code-box-line',
    
    // Form icons (Login/Register)
    'ri-eye-line',
    'ri-eye-off-line',
    'ri-facebook-fill',
    'ri-twitter-x-fill',
    'ri-github-fill',
    'ri-google-fill',
    
    // Navigation & UI icons
    'ri-menu-line',
    'ri-moon-line',
    'ri-sun-line',
    'ri-radio-button-line',
    'ri-checkbox-blank-circle-line',
    
    // Theme Example page icons
    'ri-heart-line',
    'ri-share-line',
    'ri-star-line',
    'ri-checkbox-circle-line',
    'ri-alert-line',
    'ri-error-warning-line',
  ];

  // Group icons by prefix
  const iconsByPrefix: Record<string, string[]> = {};
  usedRemixIcons.forEach((icon) => {
    const [prefix, ...nameParts] = icon.split('-');
    const name = nameParts.join('-');
    
    if (!iconsByPrefix[prefix]) {
      iconsByPrefix[prefix] = [];
    }
    iconsByPrefix[prefix].push(name);
  });

  // Load and bundle icons
  const allIcons: IconifyJSON[] = [];
  
  for (const [prefix, names] of Object.entries(iconsByPrefix)) {
    try {
      // Load icon set from @iconify/json
      const filename = require.resolve(`@iconify/json/json/${prefix}.json`);
      const content = JSON.parse(await fs.readFile(filename, 'utf8')) as IconifyJSON;
      
      // Filter to only used icons
      const filteredContent = getIcons(content, names);
      
      if (filteredContent) {
        allIcons.push(filteredContent);
        console.log(`✓ Loaded ${names.length} icons from ${prefix}`);
      }
    } catch (err) {
      console.warn(`⚠ Could not load ${prefix}:`, err);
    }
  }

  // Generate CSS from all collected icons
  const cssContent = allIcons
    .map((iconSet) => {
      const prefix = iconSet.prefix || '';
      const icons = Object.keys(iconSet.icons || {});
      
      return getIconsCSS(iconSet, icons, {
        iconSelector: `.${prefix}-{name}`,
      });
    })
    .join('\n\n');

  // Add base styles for all icons
  const baseStyles = `
/* Icon base styles */
[class^="ri-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  flex-shrink: 0;
  font-size: inherit;
  line-height: 1;
}
`;

  const finalCSS = baseStyles + '\n\n' + cssContent;

  // Save to src/assets/icons directory
  const outputPath = join(__dirname, '../assets/icons/icons.css');
  const outputDir = dirname(outputPath);
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch {
    //
  }

  await fs.writeFile(outputPath, finalCSS, 'utf8');
  
  console.log(`\n✅ Generated ${allIcons.length} icon sets to ${outputPath}`);
  console.log(`📦 Total CSS size: ${(finalCSS.length / 1024).toFixed(2)} KB`);
}

generateIconsCSS().catch((err) => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});

