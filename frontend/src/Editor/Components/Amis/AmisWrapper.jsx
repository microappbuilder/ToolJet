import React, { useEffect, useState, useRef } from 'react';

export const getAmisWrapperComponent = (amisSchemaFunction) => {
  const AmisWrapperComponent = (props = {}) => {
    const { $schema, body, render } = props;
    const [schema, setSchema] = useState(null);
    useEffect(() => {
      const result = amisSchemaFunction(props);
      if (result.then && typeof result.then === 'function') {
        result.then((data) => {
          setSchema(data);
        });
      } else {
        setSchema(result);
      }
    }, [JSON.stringify($schema)]);

    if (!schema) {
      return render('body', {
        type: 'wrapper',
        className: 'h-full flex items-center justify-center',
        body: {
          type: 'spinner',
          show: true,
        },
      });
    }

    // if (props.env?.enableAMISDebug && schema) {
    //   console.groupCollapsed(`[AmisWrapper render]`)
    //   console.trace('Component: ', props, 'Generated Amis Schema: ', schema);
    //   console.groupEnd();
    // }
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(React.Fragment, null, schema && render ? render('body', schema) : '')
    );
  };

  return AmisWrapperComponent;
};
