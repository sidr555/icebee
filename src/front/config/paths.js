const path = require('path');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL,
);

const buildPath = process.env.BUILD_PATH || 'build';

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
  'css',
  'module.css',
  'scss',
  'module.scss',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`)));

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  swSrc: resolveModule(resolveApp, 'src/service-worker'),
  publicUrlOrPath,
  // sub
  sub: resolveApp('sub'),
  subComp: resolveApp('sub/component'),
  subCon: resolveApp('sub/container'),
  subStore: resolveApp('sub/store'),
  subScss: resolveApp('sub/scss'),
  subStyled: resolveApp('sub/styled'),
  subApi: resolveApp('sub/api'),
  subCore: resolveApp('sub/core'),
  subTool: resolveApp('sub/tool'),
  subService: resolveApp('sub/service'),
  subTypes: resolveApp('sub/types'),
  subTest: resolveApp('sub/test'),
  subStatic: resolveApp('sub/static'),
  // src
  appSrc: resolveApp('src'),
  appComp: resolveApp('src/component'),
  appCon: resolveApp('src/container'),
  appStore: resolveApp('src/store'),
  appScss: resolveApp('src/scss'),
  appStyled: resolveApp('src/styled'),
  appApi: resolveApp('src/api'),
  appCore: resolveApp('src/core'),
  appTool: resolveApp('src/tool'),
  appService: resolveApp('src/service'),
  appTypes: resolveApp('src/types'),
  appTest: resolveApp('src/test'),
  appStatic: resolveApp('src/static'),
  // server
  server: resolveApp('server'),
};

module.exports.moduleFileExtensions = moduleFileExtensions;
