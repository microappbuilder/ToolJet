import React, { useEffect, useState, useRef } from 'react';
import { isEqual } from 'lodash';

const amisEmbed = window.amisRequire('amis/embed');
const amis = window.amisRequire('amis');

class RunQueryAction {
  run(action, renderer, event) {
    console.log(action, renderer, event);
    const props = renderer.props;

    props.env.runQuery(action.args);
  }
}

class UpdateDataAction {
  run(action, renderer, event) {
    console.log(action, renderer, event);
    const props = renderer.props;

    props.env.updateData(action.args);
  }
}

// 注册自定义动作
amis.registerAction('runQuery', new RunQueryAction());
amis.registerAction('updateDate', new UpdateDataAction());

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

  const amisEnv = {
    runQuery: (queryName) => {
      const filteredQuery = dataQueryRef.current.filter((query) => query.name === queryName);
      filteredQuery.length === 1 &&
        fireEvent('onTrigger', { queryId: filteredQuery[0].id, queryName: filteredQuery[0].name });
    },

    updateData: (updatedObj) => {
      setCustomProps({ ...customPropRef.current, ...updatedObj });
    },
  };
  let amisScoped = null;

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
    amisScoped = amisEmbed.embed(
      `.amis-${id}`,
      getJSON(code),
      {
        data: getJSON(data),
      },
      amisEnv
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), code]);

  useEffect(() => {
    dataQueryRef.current = dataQueries;
  }, [dataQueries]);

  useEffect(() => {
    window.addEventListener('message', (e) => {
      try {
        if (e.data.message === 'UPDATE_DATA') {
          setCustomProps({ ...customPropRef.current, ...e.data.updatedObj });
        } else if (e.data.message === 'RUN_QUERY') {
          const filteredQuery = dataQueryRef.current.filter((query) => query.name === e.data.queryName);
          filteredQuery.length === 1 &&
            fireEvent('onTrigger', { queryId: filteredQuery[0].id, queryName: filteredQuery[0].name });
        } else {
          // sendMessageToIframe(e.data);
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
