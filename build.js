// # build.js
const packager = require('electron-packager');
const rebuild = require('electron-rebuild');

packager({
    // productName: 'myclient',
    // name: 'myclient',
    dir: './',
    overwrite: true,
    asar: true,
    platform: 'win32',
    arch: 'ia32',
    icon: './icon.ico',
    prune: true,
    out: 'dist',
    executableName: 'myClient',
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    rebuild.rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((error) => callback(error));
  }],
})