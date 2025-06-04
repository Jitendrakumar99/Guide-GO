const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const url = require('url');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'png', 'jpg', 'jpeg', 'gif', 'webp',
      'mp4', 'm4v', 'mov',
      'ttf', 'otf', 'woff', 'woff2'
    ],
    extraNodeModules: {
      'idb': require.resolve('react-native-get-random-values')
    }
  },
  transformer: {
    ...defaultConfig.transformer,
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    ...defaultConfig.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Handle static asset requests
        if (req.url.startsWith('/assets/')) {
          try {
            // Parse the URL and get the pathname without query parameters
            const parsedUrl = url.parse(req.url);
            const assetPath = path.join(__dirname, decodeURIComponent(parsedUrl.pathname));
            
            // Remove any platform-specific or hash parameters from the path
            const cleanPath = assetPath.replace(/\?.*$/, '');
            
            const fs = require('fs');
            if (fs.existsSync(cleanPath)) {
              const fileContent = fs.readFileSync(cleanPath);
              res.setHeader('Content-Type', getContentType(cleanPath));
              res.setHeader('Cache-Control', 'public, max-age=31536000');
              res.end(fileContent);
              return;
            } else {
              console.error('Asset not found:', cleanPath);
            }
          } catch (error) {
            console.error('Asset loading error:', error);
          }
        }
        return middleware(req, res, next);
      };
    },
  },
};

// Helper function to determine content type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.m4v': 'video/x-m4v',
    '.mov': 'video/quicktime',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  };
  return contentTypes[ext] || 'application/octet-stream';
} 