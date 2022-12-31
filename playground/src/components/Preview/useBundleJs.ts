import { useEffect, useState } from 'react';

// eslint-disable-next-line import/no-webpack-loader-syntax
const mapstructjsJs = require('!raw-loader!../../mapstructjs.js').default;
const startPart = mapstructjsJs.substring(0, mapstructjsJs.length - 15) + '\n';

export function useBundleJs(jsCode: string) {
  const [bundleJs, setBundleJs] = useState('');

  useEffect(() => {
    const normalizedJs = jsCode
      .replace('Object.defineProperty(exports, "__esModule", { value: true });', '')
      .replace('require("@sontx/mapstructjs");', '__webpack_exports__');
    setBundleJs(startPart + normalizedJs + '\n})();');
  }, [jsCode]);

  return bundleJs;
}
