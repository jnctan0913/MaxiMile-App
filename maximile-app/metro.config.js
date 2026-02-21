const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Workaround for @supabase/supabase-js incompatibility with Metro's
// package.json exports resolution (enabled by default in SDK 53+).
// See: https://github.com/supabase/supabase-js/issues/1400
config.resolver.unstable_enablePackageExports = false;

// Allow Metro to bundle binary asset types used by the app.
config.resolver.assetExts.push('shortcut');

module.exports = config;
