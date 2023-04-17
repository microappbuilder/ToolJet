import React from 'react';
import { Tooltip } from 'react-tooltip';
import ToggleQueryEditorIcon from '../Icons/ToggleQueryEditorIcon';
import RunIcon from '../Icons/RunIcon';
import BreadcrumIcon from '../Icons/BreadcrumIcon';
import RenameIcon from '../Icons/RenameIcon';
import PreviewIcon from '../Icons/PreviewIcon';
import CreateIcon from '../Icons/CreateIcon';
import { useTranslation } from 'react-i18next';

import { useSelectedQuery } from '@/_stores/queryPanelStore';

export const QueryManagerHeader = ({
  darkMode,
  selectedDataSource,
  mode,
  addingQuery,
  editingQuery,
  options,
  toggleQueryEditor,
}) => {
  const selectedQuery = useSelectedQuery();
  const { t } = useTranslation();
  const queryName = selectedQuery?.name;
  return (
    <div className="row header" style={{ padding: '8px 0' }}>
      <div className="col d-flex align-items-center px-3 h-100 font-weight-500 py-1" style={{ gap: '10px' }}>
        {(addingQuery || editingQuery) && selectedDataSource && (
          <>
            <span
              className={`${
                darkMode ? 'color-light-gray-c3c3c3' : 'color-light-slate-11'
              } cursor-pointer font-weight-400`}
              onClick={() => {
                this.props.addNewQueryAndDeselectSelectedQuery();
              }}
              data-cy={`query-type-header`}
            >
              {mode === 'create' ? 'New Query' : 'Queries'}
            </span>
            <span className="breadcrum">
              <BreadcrumIcon />
            </span>
            <div className="query-name-breadcrum d-flex align-items-center">
              <span
                className={`query-manager-header-query-name font-weight-400 ${!this.state.renameQuery && 'ellipsis'}`}
                data-cy={`query-name-label`}
              >
                {this.state.renameQuery ? (
                  <input
                    data-cy={`query-rename-input`}
                    type="text"
                    className={`query-name query-name-input-field border-indigo-09 bg-transparent  ${
                      darkMode && 'text-white'
                    }`}
                    autoFocus
                    defaultValue={queryName}
                    onKeyUp={(event) => {
                      event.persist();
                      if (event.keyCode === 13) {
                        this.executeQueryNameUpdation(event.target.value);
                      }
                    }}
                    onBlur={({ target }) => this.executeQueryNameUpdation(target.value)}
                  />
                ) : (
                  queryName
                )}
              </span>
              <span
                className={`breadcrum-rename-query-icon ${this.state.renameQuery && 'd-none'}`}
                onClick={this.createInputElementToUpdateQueryName}
              >
                <RenameIcon />
              </span>
            </div>
          </>
        )}
      </div>
      <div className="col-auto d-flex align-items-center h-100 query-header-buttons m-auto">
        {selectedDataSource && (addingQuery || editingQuery) && (
          <button
            onClick={() => {
              const _options = { ...options };

              const query = {
                data_source_id: selectedDataSource.id === 'null' ? null : selectedDataSource.id,
                pluginId: selectedDataSource.pluginId,
                options: _options,
                kind: selectedDataSource.kind,
              };

              //   previewQuery(this, query, this.props.editorState)
              //     .then(() => {
              //       this.previewPanelRef.current.scrollIntoView();
              //     })
              //     .catch(({ error, data }) => {
              //       console.log(error, data);
              //     });
            }}
            // className={`default-tertiary-button float-right1 ${
            //   previewLoading ? (darkMode ? 'btn-loading' : 'button-loading') : ''
            // } ${darkMode ? 'theme-dark ' : ''} ${this.state.selectedDataSource ? '' : 'disabled'}`}
            // data-cy={'query-preview-button'}
            className={`default-tertiary-button float-right1 ${darkMode ? 'theme-dark ' : ''} ${
              selectedDataSource ? '' : 'disabled'
            }`}
            data-cy={'query-preview-button'}
          >
            <span
              className="query-preview-svg d-flex align-items-center query-icon-wrapper"
              style={{ width: '16px', height: '16px', padding: '2.67px 0.67px', margin: '6px 0' }}
            >
              <PreviewIcon />
            </span>
            <span>{t('editor.queryManager.preview', 'Preview')}</span>
          </button>
        )}
        {selectedDataSource && (addingQuery || editingQuery) && (
          <button
            // className={`default-tertiary-button ${
            //   isUpdating || isCreating ? (darkMode ? 'btn-loading' : 'button-loading') : ''
            // } ${darkMode ? 'theme-dark' : ''} ${this.state.selectedDataSource ? '' : 'disabled'} `}
            // onClick={this.createOrUpdateDataQuery}
            // disabled={buttonDisabled}
            // data-cy={`query-${this.state.buttonText.toLowerCase()}-button`}
            className={`default-tertiary-button  ${darkMode ? 'theme-dark' : ''} ${
              selectedDataSource ? '' : 'disabled'
            } `}
            onClick={this.createOrUpdateDataQuery}
            disabled={false}
            data-cy={`query-${this.state.buttonText.toLowerCase()}-button`}
          >
            <span className="d-flex query-create-run-svg query-icon-wrapper">
              <CreateIcon />
            </span>
            <span>{this.state.buttonText}</span>
          </button>
        )}
        {selectedDataSource && (addingQuery || editingQuery) && (
          <button
            onClick={() => {
              //   if (this.state.isFieldsChanged || this.state.addingQuery) {
              //     this.setState({ shouldRunQuery: true }, () => this.createOrUpdateDataQuery());
              //   } else {
              //     this.props.runQuery(selectedQuery?.id, selectedQuery?.name);
              //   }
            }}
            className={`border-0 default-secondary-button float-right1 ${darkMode ? 'theme-dark' : ''} ${
              this.state.selectedDataSource ? '' : 'disabled'
            } ${
              this.state.currentState.queries[selectedQuery?.name]?.isLoading
                ? darkMode
                  ? 'btn-loading'
                  : 'button-loading'
                : ''
            }`}
            data-cy="query-run-button"
          >
            <span
              className={`query-manager-btn-svg-wrapper d-flex align-item-center query-icon-wrapper query-run-svg ${
                this.state.currentState.queries[selectedQuery?.name]?.isLoading && 'invisible'
              }`}
            >
              <RunIcon />
            </span>
            <span className="query-manager-btn-name">
              {this.state.currentState.queries[selectedQuery?.name]?.isLoading ? ' ' : 'Run'}
            </span>
          </button>
        )}
        <span
          onClick={toggleQueryEditor}
          className={`cursor-pointer m-3 toggle-query-editor-svg d-flex`}
          data-tooltip-id="tooltip-for-hide-query-editor"
          data-tooltip-content="Hide query editor"
        >
          <ToggleQueryEditorIcon />
        </span>
        <Tooltip id="tooltip-for-hide-query-editor" className="tooltip" />
      </div>
    </div>
  );
};
