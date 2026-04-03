const fs   = require('fs');
const path = require('path');

// The @expo-google-fonts/caveat package's index.js references multiple font
// weight TTF files that were never actually shipped. We fill the gaps by
// copying the Regular weight — this makes Metro happy and the fonts still render.
const caveatBase = path.join(__dirname, '..', 'node_modules', '@expo-google-fonts', 'caveat');
const src        = path.join(caveatBase, '400Regular', 'Caveat_400Regular.ttf');

const missing = [
  { dir: '500Medium',  file: 'Caveat_500Medium.ttf'  },
  { dir: '600SemiBold',file: 'Caveat_600SemiBold.ttf'},
  { dir: '700Bold',    file: 'Caveat_700Bold.ttf'    },
];

if (!fs.existsSync(src)) {
  console.warn('⚠️  Caveat 400Regular not found — skipping patch');
  process.exit(0);
}

missing.forEach(({ dir, file }) => {
  const destDir  = path.join(caveatBase, dir);
  const destFile = path.join(destDir, file);
  if (!fs.existsSync(destFile)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, destFile);
    console.log(`✅ Patched: Created missing ${file}`);
  }
});

console.log('✅ Caveat font patch complete');
