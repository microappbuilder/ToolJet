import React, { useEffect, useState, useRef } from 'react';
import { isEqual } from 'lodash';

export const Amis = (props) => {
  const { height, properties, styles, id, setExposedVariable, exposedVariables, fireEvent, dataQueries, dataCy } =
    props;
  const { visibility } = styles;
  const { code, data } = properties;
  const [customProps, setCustomProps] = useState(data);
  const dataQueryRef = useRef(dataQueries);
  const customPropRef = useRef(data);

  const getJSON = (config) => {
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

  let amisScoped = null;
  const amis = window.amisRequire('amis/embed');

  useEffect(() => {
    setCustomProps(data);
    customPropRef.current = data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  useEffect(() => {
    if (!isEqual(exposedVariables.data, customProps)) {
      setExposedVariable('data', customProps);
      //   sendMessageToIframe({ message: 'DATA_UPDATED' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setExposedVariable, customProps, exposedVariables.data]);

  useEffect(() => {
    // sendMessageToIframe({ message: 'CODE_UPDATED' });
    amisScoped = amis.embed(`.amis-${id}`, getJSON(code), { data: getJSON(data) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), code]);

  useEffect(() => {
    dataQueryRef.current = dataQueries;
  }, [dataQueries]);

  useEffect(() => {
    window.addEventListener('message', (e) => {
      try {
        if (e.data.from === 'customComponent' && e.data.componentId === id) {
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

  return (
    <div className={`amis-${id}`} style={{ display: visibility ? '' : 'none', height }} data-cy={dataCy}>
      {/* <iframe
            srcDoc={iframeContent}
            style={{ width: '100%', height: '100%', border: 'none' }}
            ref={iFrameRef}
            data-id={id}
        ></iframe>  */}
    </div>
  );
};
