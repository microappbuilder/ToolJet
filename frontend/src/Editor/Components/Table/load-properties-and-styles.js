export default function loadPropertiesAndStyles(properties, styles, darkMode, component) {
  const color = styles.textColor !== '#000' ? styles.textColor : darkMode && '#fff';

  let serverSidePagination = properties.serverSidePagination ?? false;
  if (typeof serverSidePagination !== 'boolean') serverSidePagination = false;

  const serverSideSearch = properties.serverSideSearch ?? false;

  const displaySearchBox = properties.displaySearchBox ?? true;

  const showDownloadButton = properties.showDownloadButton ?? true;

  const showFilterButton = properties.showFilterButton ?? true;

  const showBulkUpdateActions = properties.showBulkUpdateActions ?? true;

  const showBulkSelector = properties.showBulkSelector ?? false;

  const highlightSelectedRow = properties.highlightSelectedRow ?? false;

  let clientSidePagination = properties.clientSidePagination ?? !serverSidePagination;
  if (typeof clientSidePagination !== 'boolean') clientSidePagination = true;

  const loadingState = properties.loadingState ?? false;

  const tableType = styles.tableType ?? 'table-bordered';

  const cellSizeType = styles?.cellSizeType;

  const borderRadius = styles.borderRadius?.value;

  const widgetVisibility = styles?.visibility?.value ?? true;
  const parsedWidgetVisibility = widgetVisibility;

  const disabledState = styles?.disabledState?.value ?? false;
  const parsedDisabledState = disabledState;

  const actions = component.definition.properties.actions || { value: [] };

  return {
    color,
    serverSidePagination,
    clientSidePagination,
    serverSideSearch,
    displaySearchBox,
    showDownloadButton,
    showFilterButton,
    showBulkUpdateActions,
    showBulkSelector,
    highlightSelectedRow,
    tableType,
    cellSizeType,
    borderRadius,
    parsedWidgetVisibility,
    parsedDisabledState,
    loadingState,
    actions,
  };
}