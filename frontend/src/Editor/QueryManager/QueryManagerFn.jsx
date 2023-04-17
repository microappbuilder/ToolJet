import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { QueryManagerHeader } from './Components/QueryManagerHeader';
import { QueryManagerBody } from './Components/QueryManagerBody';
import { useDataSourcesLoading } from '@/_stores/dataSourcesStore';
import { useSelectedQuery } from '@/_stores/queryPanelStore';

export const QueryManagerFn = ({
  darkMode,
  selectedDataSource,
  mode,
  addingQuery,
  editingQuery,
  toggleQueryEditor,
  isSourceSelected,
}) => {
  const loadingDataSources = useDataSourcesLoading();
  const selectedQuery = useSelectedQuery();
  const [options, setOptions] = useState({});

  useEffect(() => {
    setOptions(selectedQuery?.options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuery?.id]);

  return (
    <div
      className={cx(`query-manager ${darkMode ? 'theme-dark' : ''}`, {
        'd-none': loadingDataSources,
      })}
    >
      <QueryManagerHeader
        darkMode={darkMode}
        selectedDataSource={selectedDataSource}
        mode={mode}
        addingQuery={addingQuery}
        editingQuery={editingQuery}
        options={options}
        toggleQueryEditor={toggleQueryEditor}
      />
      <QueryManagerBody
        darkMode={darkMode}
        selectedDataSource={selectedDataSource}
        mode={mode}
        addingQuery={addingQuery}
        editingQuery={editingQuery}
        options={options}
        isSourceSelected={isSourceSelected}
      />
    </div>
  );
};
