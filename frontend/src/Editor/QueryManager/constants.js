export const queryNameRegex = new RegExp('^[A-Za-z0-9_-]*$');

export const STATIC_DATA_SOURCES = [
  { kind: 'tooljetdb', id: 'null', name: 'Tooljet Database' },
  { kind: 'restapi', id: 'null', name: 'REST API' },
  { kind: 'runjs', id: 'runjs', name: 'Run JavaScript code' },
  { kind: 'runpy', id: 'runpy', name: 'Run Python code' },
];

export const MOCK_COMPONENT_META = {
  events: {
    onDataQuerySuccess: { displayName: 'Query Success' },
    onDataQueryFailure: { displayName: 'Query Failure' },
  },
};
