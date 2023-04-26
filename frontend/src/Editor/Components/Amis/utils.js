import React from 'react';
import ReactDOM from 'react-dom';

import { getAmisWrapperComponent } from './AmisWrapper';

const ASSET_PACKAGES = {};
const ASSET_INJECT_URLS = {};
const ASSET_AMIS_COMPONENTS = {};

export const getJSON = (config) => {
  let json = config;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  if (typeof config === 'string') {
    try {
      json = JSON.parse(config);
    } catch (e) {
      console.error(e);
    }
  }
  return json;
};

export const injectScript = async (src, { async = false, defer = true }) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = async;
    script.defer = defer;
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    document.head.appendChild(script);
  });
};

export const injectCSS = (cssUrl, { insertAt = 'bottom' } = {}) => {
  if (!cssUrl || typeof document === 'undefined') return;
  if (ASSET_INJECT_URLS[cssUrl]) return;
  ASSET_INJECT_URLS[cssUrl] = 'loading';

  const head = document.head || document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = cssUrl;

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(link, head.firstChild);
    } else {
      head.appendChild(link);
    }
  } else {
    head.appendChild(link);
  }
  ASSET_INJECT_URLS[cssUrl] = 'done';
};

export const injectAmis = async ({ cdnUrl = 'https://unpkg.com', amisVersion = '2.9.0', amisTheme = 'antd' }) => {
  await injectScript(`${cdnUrl}/@steedos-builder/sdk@0.2.37/dist/index.umd.js`, { async: false, defer: true });
  await injectScript(`${cdnUrl}/amis@${amisVersion}/sdk/sdk.js`, { async: false, defer: true });
  await injectScript(`${cdnUrl}/lodash@4.17.21/lodash.min.js`, { async: false, defer: true });
  injectCSS(`${cdnUrl}/amis@${amisVersion}/lib/themes/${amisTheme}.css`);
  injectCSS(`${cdnUrl}/amis@${amisVersion}/lib/helper.css`);
  injectCSS(`${cdnUrl}/amis@${amisVersion}/sdk/iconfont.css`);
  injectCSS(`${cdnUrl}/@fortawesome/fontawesome-free@6.2.0/css/all.min.css`);
  window['Builder'] = window.BuilderSDK.Builder;
  window['builder'] = window.BuilderSDK.builder;
  window['React'] = window.amisRequire('react');
  window['ReactDOM'] = window.amisRequire('react-dom');
};

export const injectAssets = async (assetUrls, { cdnUrl = 'https://unpkg.com' } = {}) => {
  if (typeof assetUrls == 'string') {
    assetUrls = assetUrls.split(',');
  }

  for await (const assetUrl of assetUrls) {
    var url = assetUrl.replace('https://unpkg.com', cdnUrl);

    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    const assets = await res.json();
    await registerAssets(assets);
  }
};
export const registerAssets = async (assets, { cdnUrl = 'https://unpkg.com' } = {}) => {
  const { packages = [], components = [] } = assets;

  packages.forEach(async (pkg, index) => {
    // console.log(pkg, index);
    if (pkg.urls && Array.isArray(pkg.urls) && pkg.urls.length > 0) {
      if (pkg.package && pkg.library) {
        var url = pkg.urls[0];
        var cssUrl = pkg.urls[1];
        if (url?.endsWith('.js')) {
          url = url.replace('https://unpkg.com', cdnUrl);
          if (typeof window[pkg.library] === 'undefined') {
            await injectScript(url, { async: false, defer: true });
          }
          ASSET_PACKAGES[pkg.package] = pkg;
        }
        if (cssUrl?.endsWith('.css')) {
          cssUrl = cssUrl.replace('https://unpkg.com', cdnUrl);
          injectCSS(cssUrl);
        }
      }
    }
  });

  for await (const packageMeta of components) {
    if (packageMeta.url) {
      const packageMetaUrl = packageMeta.url.replace('https://unpkg.com', cdnUrl);
      await injectScript(packageMetaUrl, { async: false, defer: true });
      if (packageMeta.exportName && typeof window[packageMeta.exportName] !== 'undefined') {
        const packageMetaContent = window[packageMeta.exportName];
        if (packageMetaContent && packageMetaContent.components) {
          packageMetaContent.components.forEach(async (meta, index) => {
            if (meta.npm?.package && meta.npm?.exportName) {
              const library = ASSET_PACKAGES[meta.npm.package]?.library;
              if (library) {
                const pkg = window[library];
                if (pkg) {
                  registerAmisComponent(pkg[meta.npm.exportName], meta);
                }
              }
            }
          });
        }
      }
    }
  }
};

export const registerAmisComponent = (component, meta) => {
  if (!meta || !meta.amis || !meta.amis.render) return;

  if (ASSET_AMIS_COMPONENTS[meta.amis.render.type]) return;
  ASSET_AMIS_COMPONENTS[meta.amis.render.type] = 'loading';

  console.log('registerAmisComponent', meta);
  let amisLib = window.amisRequire('amis');
  const AMIS_REGISTER_MAP = {
    renderer: amisLib.Renderer,
    formitem: amisLib.FormItem,
    options: amisLib.OptionsControl,
  };

  let amisComponent = component;
  if (meta.componentType === 'amisSchema') {
    amisComponent = getAmisWrapperComponent(component);
  }

  AMIS_REGISTER_MAP[meta.amis.render.usage]({
    // test: new RegExp(`(^|\/)${meta.amis.render.type}`),
    type: meta.amis.render.type,
    weight: meta.amis.render.weight,
    autoVar: true,
  })(amisComponent);
  ASSET_AMIS_COMPONENTS[meta.amis.render.type] = 'ready';
};
