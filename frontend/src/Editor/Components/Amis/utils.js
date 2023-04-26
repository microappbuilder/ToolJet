export const getAmisEnv = () => {
  return {
    theme: 'antd',
  };
};

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
};

export const injectAmis = async ({ cdnUrl = 'https://unpkg.com', amisVersion = '2.9.0', theme = 'antd' }) => {
  await injectScript(`${cdnUrl}/amis@${amisVersion}/sdk/sdk.js`, { async: false, defer: true });
  injectCSS(`${cdnUrl}/amis@${amisVersion}/lib/themes/${theme}.css`);
  injectCSS(`${cdnUrl}/amis@${amisVersion}/lib/helper.css`);
  injectCSS(`${cdnUrl}/amis@${amisVersion}/sdk/iconfont.css`);
  injectCSS(`${cdnUrl}/@fortawesome/fontawesome-free@6.2.0/css/all.min.css`);
};
