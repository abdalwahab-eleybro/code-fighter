// Build Script
// Bundles all CSS and JS into single files for production

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy HTML
function copyHTML() {
  const srcHTML = path.join(srcDir, 'index.html');
  const distHTML = path.join(distDir, 'index.html');
  
  if (fs.existsSync(srcHTML)) {
    let content = fs.readFileSync(srcHTML, 'utf8');
    
    // Update script and link paths for production
    content = content.replace(
      /<script type="module" src="js\//g,
      '<script type="module" src="'
    );
    content = content.replace(
      /<link rel="stylesheet" href="css\//g,
      '<link rel="stylesheet" href="'
    );
    
    fs.writeFileSync(distHTML, content);
    console.log('✓ Copied index.html');
  }
}

// Bundle CSS
function bundleCSS() {
  const cssFiles = [
    'themes.css',
    'animations.css',
    'components.css'
  ];
  
  let bundledCSS = '';
  
  cssFiles.forEach(file => {
    const filePath = path.join(srcDir, 'css', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Remove duplicate :root definitions
      if (file !== 'themes.css') {
        bundledCSS += content.replace(/^:root[^}]+\{[^}]+\}[^}]+\}/gm, '');
      } else {
        bundledCSS += content + '\n\n';
      }
      console.log(`✓ Bundled ${file}`);
    }
  });
  
  fs.writeFileSync(path.join(distDir, 'bundle.css'), bundledCSS);
  console.log('✓ Created bundle.css');
}

// Bundle JS (simple concatenation for now)
function bundleJS() {
  const jsFiles = [
    'config/theme.js',
    'config/game.js',
    'data/fighters.js',
    'core/utils.js',
    'core/state.js',
    'code-fighter.js'
  ];
  
  let bundledJS = '';
  
  jsFiles.forEach(file => {
    const filePath = path.join(srcDir, 'js', file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove export/import statements for bundling
      content = content.replace(/^export[^;]+;?$/gm, '');
      content = content.replace(/^import[^;]+;?$/gm, '');
      
      bundledJS += content + '\n\n';
      console.log(`✓ Bundled ${file}`);
    }
  });
  
  fs.writeFileSync(path.join(distDir, 'bundle.js'), bundledJS);
  console.log('✓ Created bundle.js');
}

// Copy assets
function copyAssets() {
  const assetsSrc = path.join(srcDir, 'assets');
  const assetsDist = path.join(distDir, 'assets');
  
  if (fs.existsSync(assetsSrc)) {
    if (!fs.existsSync(assetsDist)) {
      fs.mkdirSync(assetsDist, { recursive: true });
    }
    
    const files = fs.readdirSync(assetsSrc);
    files.forEach(file => {
      const srcPath = path.join(assetsSrc, file);
      const distPath = path.join(assetsDist, file);
      fs.copyFileSync(srcPath, distPath);
      console.log(`✓ Copied asset: ${file}`);
    });
  }
}

// Copy templates
function copyTemplates() {
  const templatesSrc = path.join(srcDir, 'templates');
  const templatesDist = path.join(distDir, 'templates');
  
  if (fs.existsSync(templatesSrc)) {
    if (!fs.existsSync(templatesDist)) {
      fs.mkdirSync(templatesDist, { recursive: true });
    }
    
    const files = fs.readdirSync(templatesSrc);
    files.forEach(file => {
      const srcPath = path.join(templatesSrc, file);
      const distPath = path.join(templatesDist, file);
      fs.copyFileSync(srcPath, distPath);
      console.log(`✓ Copied template: ${file}`);
    });
  }
}

// Main build function
function build() {
  console.log('Building Code Fighter...\n');
  
  copyHTML();
  bundleCSS();
  bundleJS();
  copyAssets();
  copyTemplates();
  
  console.log('\n✅ Build complete! Files are in the dist/ directory.');
}

build();
