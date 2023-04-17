import React from 'react';
import { useTranslation } from 'react-i18next';
import { Transformation } from '../Transformation';
import { EventManager } from '@/Editor/Inspector/EventManager';
import { CodeHinter } from '@/Editor/CodeBuilder/CodeHinter';
import DataSourceLister from '../DataSourceLister';
import { CustomToggleSwitch } from '../CustomToggleSwitch';
import { ChangeDataSource } from '../ChangeDataSource';
import Preview from '../Preview';
import { STATIC_DATA_SOURCES, MOCK_COMPONENT_META } from '../constants';
import { allSources, source } from '../QueryEditors';
import { DataSourceTypes } from '../../DataSourceManager/SourceComponents';

import { useSelectedQuery } from '@/_stores/queryPanelStore';
import { useDataSources, useGlobalDataSources } from '@/_stores/dataSourcesStore';

export const QueryManagerBody = ({
  darkMode,
  selectedDataSource,
  mode,
  addingQuery,
  editingQuery,
  options,
  isSourceSelected,
}) => {
  const selectedQuery = useSelectedQuery();
  const dataSources = useDataSources();
  const globalDataSources = useGlobalDataSources();
  const { t } = useTranslation();
  const dataSourceMeta = selectedQuery?.pluginId
    ? selectedQuery?.manifestFile?.data?.source
    : DataSourceTypes.find((source) => source.kind === selectedQuery?.kind);

  let ElementToRender = '';

  if (selectedDataSource) {
    const sourcecomponentName = selectedDataSource.kind.charAt(0).toUpperCase() + selectedDataSource.kind.slice(1);
    ElementToRender = selectedDataSource?.pluginId ? source : allSources[sourcecomponentName];
  }

  return (
    <>
      {(addingQuery || editingQuery) && (
        <div>
          <div
            className={`row row-deck px-2 mt-0 query-details ${
              selectedDataSource?.kind === 'tooljetdb' && 'tooljetdb-query-details'
            }`}
          >
            {dataSources && mode === 'create' && !isSourceSelected && (
              <>
                <div className="datasource-picker">
                  <label className="form-label col-md-3" data-cy={'label-select-datasource'}>
                    {t('editor.queryManager.selectDatasource', 'Select Datasource')}
                  </label>
                  <DataSourceLister
                    dataSources={dataSources}
                    staticDataSources={STATIC_DATA_SOURCES}
                    changeDataSource={this.changeDataSource}
                    handleBackButton={this.handleBackButton}
                    darkMode={this.props.darkMode}
                    showAddDatasourceBtn={false}
                    dataSourceModalHandler={this.props.dataSourceModalHandler}
                  />
                </div>
                <div className="datasource-picker">
                  <label className="form-label col-md-3">Global Datasources</label>
                  <DataSourceLister
                    dataSources={globalDataSources}
                    staticDataSources={[]}
                    changeDataSource={this.changeDataSource}
                    handleBackButton={this.handleBackButton}
                    darkMode={this.props.darkMode}
                    dataSourceModalHandler={this.props.dataSourceModalHandler}
                    showAddDatasourceBtn={false}
                  />
                </div>
              </>
            )}

            {selectedDataSource && (
              <div style={{ padding: '0 32px' }}>
                <div>
                  <ElementToRender
                    pluginSchema={this.state.selectedDataSource?.plugin?.operationsFile?.data}
                    selectedDataSource={selectedDataSource}
                    options={this.state.options}
                    optionsChanged={this.optionsChanged}
                    optionchanged={this.optionchanged}
                    currentState={this.props.currentState}
                    darkMode={this.props.darkMode}
                    isEditMode={true} // Made TRUE always to avoid setting default options again
                    queryName={this.state.queryName}
                  />

                  {!dataSourceMeta?.disableTransformations &&
                    (selectedDataSource?.kind != 'runjs' || selectedDataSource?.kind != 'runpy') && (
                      <div>
                        <Transformation
                          changeOption={this.optionchanged}
                          options={options ?? {}}
                          currentState={this.props.currentState}
                          darkMode={this.props.darkMode}
                          queryId={selectedQuery?.id}
                        />
                      </div>
                    )}
                  <Preview
                    previewPanelRef={this.previewPanelRef}
                    // previewLoading={previewLoading}
                    // queryPreviewData={queryPreviewData}
                    theme={this.state.theme}
                    darkMode={this.props.darkMode}
                  />
                </div>
              </div>
            )}
          </div>

          {selectedDataSource && (addingQuery || editingQuery) && (
            <div className="advanced-options-container font-weight-400 border-top query-manager-border-color">
              <div className="advance-options-input-form-container">
                <div className="mx-4">
                  <CustomToggleSwitch
                    dataCy={`run-on-app-load`}
                    isChecked={this.state.options.runOnPageLoad}
                    toggleSwitchFunction={this.toggleOption}
                    action="runOnPageLoad"
                    darkMode={this.props.darkMode}
                    label={t('editor.queryManager.runQueryOnApplicationLoad', 'Run this query on application load?')}
                  />
                </div>
                <div className=" mx-4 pb-3 pt-3">
                  <CustomToggleSwitch
                    dataCy={`confirmation-before-run`}
                    isChecked={this.state.options.requestConfirmation}
                    toggleSwitchFunction={this.toggleOption}
                    action="requestConfirmation"
                    darkMode={this.props.darkMode}
                    label={t('editor.queryManager.confirmBeforeQueryRun', 'Request confirmation before running query?')}
                  />
                </div>
                <div className=" mx-4">
                  <CustomToggleSwitch
                    dataCy={`notification-on-success`}
                    isChecked={this.state.options.showSuccessNotification}
                    toggleSwitchFunction={this.toggleOption}
                    action="showSuccessNotification"
                    darkMode={this.props.darkMode}
                    label={t('editor.queryManager.notificationOnSuccess', 'Show notification on success?')}
                  />
                </div>
                {this.state.options.showSuccessNotification && (
                  <div className="mx-4" style={{ paddingLeft: '100px', paddingTop: '12px' }}>
                    <div className="row mt-1">
                      <div className="col-auto" style={{ width: '200px' }}>
                        <label className="form-label p-2 font-size-12" data-cy={'label-success-message-input'}>
                          {t('editor.queryManager.successMessage', 'Success Message')}
                        </label>
                      </div>
                      <div className="col">
                        <CodeHinter
                          currentState={this.props.currentState}
                          initialValue={this.state.options.successMessage}
                          height="36px"
                          theme={this.props.darkMode ? 'monokai' : 'default'}
                          onChange={(value) => this.optionchanged('successMessage', value)}
                          placeholder={t('editor.queryManager.queryRanSuccessfully', 'Query ran successfully')}
                          cyLabel={'success-message'}
                        />
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-auto" style={{ width: '200px' }}>
                        <label className="form-label p-2 font-size-12" data-cy={'label-notification-duration-input'}>
                          {t('editor.queryManager.notificationDuration', 'Notification duration (s)')}
                        </label>
                      </div>
                      <div className="col query-manager-input-elem">
                        <input
                          type="number"
                          disabled={!this.state.options.showSuccessNotification}
                          onChange={(e) => this.optionchanged('notificationDuration', e.target.value)}
                          placeholder={5}
                          className="form-control"
                          value={this.state.options.notificationDuration}
                          data-cy={'notification-duration-input-field'}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`border-top query-manager-border-color hr-text-left px-4 ${
                  this.props.darkMode ? 'color-white' : 'color-light-slate-12'
                }`}
                style={{ paddingTop: '28px' }}
              >
                {t('editor.queryManager.eventsHandler', 'Events Handler')}
              </div>
              <div className="query-manager-events px-4 mt-2 pb-4">
                <EventManager
                  eventsChanged={this.eventsChanged}
                  component={{ definition: { events: options?.events || [] } }}
                  componentMeta={MOCK_COMPONENT_META}
                  currentState={this.props.currentState}
                  dataQueries={this.props.dataQueries}
                  components={this.props.allComponents}
                  apps={this.props.apps}
                  popoverPlacement="top"
                  pages={
                    this.props.appDefinition?.pages
                      ? Object.entries(this.props.appDefinition?.pages).map(([id, page]) => ({ ...page, id }))
                      : []
                  }
                />
              </div>
              {mode === 'edit' && selectedQuery.data_source_id && (
                <div className="mt-2 pb-4">
                  <div
                    className={`border-top query-manager-border-color px-4 hr-text-left py-2 ${
                      this.props.darkMode ? 'color-white' : 'color-light-slate-12'
                    }`}
                  >
                    Change Datasource
                  </div>
                  <ChangeDataSource
                    dataSources={[...globalDataSources, ...dataSources]}
                    value={selectedDataSource}
                    selectedQuery={selectedQuery}
                    onChange={(selectedDataSource) => {
                      this.changeDataSourceQueryAssociation(selectedDataSource, selectedQuery);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
