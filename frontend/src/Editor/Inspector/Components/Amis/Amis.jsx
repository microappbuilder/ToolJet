import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { renderElement } from '@/Editor/Inspector/Utils';
import { CodeHinter } from '@/Editor/CodeBuilder/CodeHinter';
import Button from '@/_ui/Button';
import Accordion from '@/_ui/Accordion';
import { useTranslation } from 'react-i18next';
import { adapt } from 'webcomponents-in-react';
import { resolveReferences } from '@/_helpers/utils';

const BuilderFiddle = adapt('builder-fiddle');

export const Amis = function Amis(props) {
  const {
    dataQueries,
    component,
    paramUpdated,
    componentMeta,
    components,
    darkMode,
    currentState,
    layoutPropertyChanged,
  } = props;
  const [showEditor, setShowEditor] = useState(false);
  const code = component.component.definition.properties.code;
  const data = component.component.definition.properties.data;
  const { t } = useTranslation();

  const editorSettings = {
    pageId: 'xxx',
    messageOnly: true,
    hiddenDeploy: true,
  };

  window.addEventListener('message', function (event) {
    if (event.data) {
      // if (event.data.type === 'builder.loadContent') {
      // }
      if (event.data.type === 'builder.saveContent') {
        paramUpdated({ name: 'code' }, 'value', JSON.stringify(event.data.data.data.AmisSchema), 'properties');
        setShowEditor(false);
      }
      // if(event.data.type === "builder.deployContent"){
      // }
    }
  });

  const onAmisDesignerButtonClick = () => {
    setShowEditor(true);
  };

  const getAmisSchema = () => {
    const schemaResolved = resolveReferences(component.component.definition.properties.code?.value, currentState);

    const dataResolved = resolveReferences(component.component.definition.properties.data?.value, currentState);

    let schema = schemaResolved;
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        console.log(error);
      }
    }

    let defaultData = dataResolved;
    if (typeof defaultData === 'string') {
      try {
        defaultData = JSON.parse(defaultData);
      } catch (error) {
        console.log(error);
      }
    }

    schema.data = {
      ...schema.data,
      ...defaultData,
    };
    return schema;
  };

  let items = [];

  items.push({
    title: 'Data',
    children: (
      <CodeHinter
        currentState={currentState}
        mode="json"
        initialValue={data.value ?? {}}
        theme={darkMode ? 'monokai' : 'base16-light'}
        onChange={(value) => paramUpdated({ name: 'data' }, 'value', value, 'properties')}
        componentName={`widget/${component.component.name}/data`}
      />
    ),
  });

  items.push({
    title: 'Amis Schema',
    children: (
      <>
        <Button variant="outline-primary" onClick={onAmisDesignerButtonClick}>
          {t('amis.designer', 'Amis Designer')}
        </Button>
        <Modal show={showEditor} fullscreen={true} onHide={() => setShowEditor(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('amis.designer', 'Amis Designer')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <BuilderFiddle
              host="https://builder.steedos.cn/amis"
              settings={editorSettings}
              data={{ AmisSchema: getAmisSchema() }}
            ></BuilderFiddle>
          </Modal.Body>
        </Modal>
        <CodeHinter
          currentState={currentState}
          initialValue={code.value ?? {}}
          theme={darkMode ? 'monokai' : 'base16-light'}
          mode="json"
          lineNumbers
          className="custom-component"
          onChange={(value) => paramUpdated({ name: 'code' }, 'value', value, 'properties')}
          componentName={`widget/${component.component.name}/code`}
          enablePreview={true}
          height={400}
          hideSuggestion
        />
      </>
    ),
  });

  items.push({
    title: 'Layout',
    isOpen: false,
    children: (
      <>
        {renderElement(
          component,
          componentMeta,
          layoutPropertyChanged,
          dataQueries,
          'showOnDesktop',
          'others',
          currentState,
          components
        )}
        {renderElement(
          component,
          componentMeta,
          layoutPropertyChanged,
          dataQueries,
          'showOnMobile',
          'others',
          currentState,
          components
        )}
      </>
    ),
  });
  return <Accordion items={items} />;
};
