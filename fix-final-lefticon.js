const fs = require('fs');

const files = [
  'src/app/timestamp-converter/page.tsx',
  'src/app/website-analyzer/page.tsx', 
  'src/app/js-minifier/page.tsx',
  'src/app/not-found.tsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Remove leftIcon props from buttons and convert to inline icons
    const leftIconPattern = /leftIcon=\{<(\w+) className="([^"]*)" \/>\}/g;
    
    if (leftIconPattern.test(content)) {
      // Reset regex
      leftIconPattern.lastIndex = 0;
      content = content.replace(leftIconPattern, '');
      
      // Find button opening tags and add icons inside
      const buttonPattern = /<Button([^>]*?)>/g;
      content = content.replace(buttonPattern, (match, props) => {
        if (props.includes('leftIcon')) {
          // Extract the icon from leftIcon prop if it's still there
          const iconMatch = match.match(/leftIcon=\{<(\w+) className="([^"]*)" \/>\}/);
          if (iconMatch) {
            const iconName = iconMatch[1];
            const iconClasses = iconMatch[2];
            // Remove the leftIcon prop
            const cleanProps = props.replace(/\s*leftIcon=\{[^}]+\}/, '');
            return `<Button${cleanProps}>\n        <${iconName} className="${iconClasses} mr-1" />`;
          }
        }
        return match;
      });
      
      modified = true;
    }
    
    // Fix 'default' variant to 'primary'
    if (content.includes("variant='default'") || content.includes('variant="default"')) {
      content = content.replace(/variant=['"]default['"]/g, 'variant="primary"');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed: ${file}`);
    }
  } catch (error) {
    console.log(`Error processing ${file}:`, error.message);
  }
});

console.log('Final leftIcon fixes completed!');
