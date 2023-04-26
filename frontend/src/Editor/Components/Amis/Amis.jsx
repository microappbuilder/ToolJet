import React, { useEffect, useState, useRef } from 'react';
import { isEqual } from 'lodash';
import { resolveReferences, validateWidget } from '@/_helpers/utils';
import { getJSON, injectAmis, injectAssets } from './utils';
import { RunQueryAction, UpdateDataAction } from './AmisActions.js';

export const Amis = (props) => {
  const {
    component,
    currentState,
    height,
    properties,
    styles,
    id,
    setExposedVariable,
    exposedVariables,
    fireEvent,
    dataQueries,
    dataCy,
  } = props;
  const { visibility } = styles;
  const { code, data } = properties;
  const { client, variables } = currentState;
  const [customProps, setCustomProps] = useState(data);
  const dataQueryRef = useRef(dataQueries);
  const customPropRef = useRef(data);
  const amisScopedRef = useRef(null);
  const [amisLoaded, setAmisLoaded] = useState(window.amisRequire != null);
  const [amisSchema, setAmisSchema] = React.useState({});

  const amisVersion = client.AMIS_VERSION || '2.9.0';
  const amisTheme = client.AMIS_THEME || 'antd';
  const assetUrls = client.ASSET_URLS;
  const cdnUrl = client.CDN_URL || process.env.CDN_URL || 'https://unpkg.steedos.cn';

  const [assetsLoaded, setAssetsLoaded] = useState(!assetUrls);

  useEffect(() => {
    if (amisLoaded) return;

    injectAmis({
      amisVersion,
      cdnUrl,
      amisTheme,
    }).then(() => {
      setAmisLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!amisLoaded || assetsLoaded) return;

    // 注册自定义动作
    window.amisRequire('amis').registerAction('runQuery', new RunQueryAction());
    window.amisRequire('amis').registerAction('updateData', new UpdateDataAction());

    if (assetUrls) {
      injectAssets(assetUrls).then(() => {
        setAssetsLoaded(true);
      });
    }
  }, [amisLoaded]);

  useEffect(() => {
    // console.log('data changed', id, data);
    setCustomProps(data);
    customPropRef.current = data;
    amisScopedRef.current?.updateProps({
      data,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  useEffect(() => {
    // console.log('customProps changed', id, customProps);
    if (!isEqual(exposedVariables.data, customProps)) {
      setExposedVariable('data', customProps);
      //   sendMessageToIframe({ message: 'DATA_UPDATED' });
    }
    amisScopedRef.current?.updateProps({
      data: customProps,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setExposedVariable, customProps, exposedVariables.data]);

  useEffect(() => {
    setAmisSchema(getJSON(code) || {});
  }, [JSON.stringify(code)]);

  useEffect(() => {
    // console.log('amisSchema changed', id, amisSchema, code, props);
    if (!amisLoaded || !assetsLoaded) return;

    const context = Object.assign({}, amisSchema?.data?.context, data?.context);
    window.Builder.set(context);

    amisScopedRef.current = window.amisRequire('amis/embed').embed(
      `.amis-${id}`,
      amisSchema,
      {
        data: data,
        componentId: id,
      },
      {
        theme: amisTheme,
        componentId: id,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amisSchema, amisLoaded, assetsLoaded]);

  useEffect(() => {
    dataQueryRef.current = dataQueries;
  }, [dataQueries]);

  useEffect(() => {
    window.addEventListener('message', (e) => {
      try {
        if (e.data.from === 'amis' && e.data.componentId === id) {
          if (e.data.message === 'UPDATE_DATA') {
            setCustomProps({ ...customPropRef.current, ...e.data.updatedObj });
          } else if (e.data.message === 'RUN_QUERY') {
            const filteredQuery = dataQueryRef.current.filter((query) => query.name === e.data.queryName);
            filteredQuery.length === 1 &&
              fireEvent('onTrigger', { queryId: filteredQuery[0].id, queryName: filteredQuery[0].name });
          } else {
            // sendMessageToIframe(e.data);
          }
        }
      } catch (err) {
        console.log(err);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //   const sendMessageToIframe = ({ message }) => {
  //     if (!iFrameRef.current) return;
  //     switch (message) {
  //       case 'INIT':
  //         return iFrameRef.current.contentWindow.postMessage(
  //           {
  //             message: 'INIT_RESPONSE',
  //             componentId: id,
  //             data: customProps,
  //             code: code,
  //           },
  //           '*'
  //         );
  //       case 'CODE_UPDATED':
  //         return iFrameRef.current.contentWindow.postMessage(
  //           {
  //             message: 'CODE_UPDATED',
  //             componentId: id,
  //             data: customProps,
  //             code: code,
  //           },
  //           '*'
  //         );
  //       case 'DATA_UPDATED':
  //         return iFrameRef.current.contentWindow.postMessage(
  //           {
  //             message: 'DATA_UPDATED',
  //             componentId: id,
  //             data: customProps,
  //           },
  //           '*'
  //         );
  //       default:
  //         return;
  //     }
  //   };

  return <div className={`amis-${id}`} style={{ display: visibility ? '' : 'none', height }} data-cy={dataCy}></div>;
};
