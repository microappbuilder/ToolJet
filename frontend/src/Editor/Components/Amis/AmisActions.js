export class RunQueryAction {
  run(action, renderer, event) {
    const props = renderer.props;
    // console.log("RUN_QUERY", props.componentId, action, renderer, event);

    window.postMessage(
      {
        from: 'amis',
        message: 'RUN_QUERY',
        queryName: action.query,
        componentId: props.componentId,
      },
      '*'
    );
  }
}

export class UpdateDataAction {
  run(action, renderer, event) {
    const props = renderer.props;
    // console.log("UPDATE_DATA", props.componentId, action, renderer, event);

    window.postMessage(
      {
        from: 'amis',
        message: 'UPDATE_DATA',
        updatedObj: action.args,
        componentId: props.componentId,
      },
      '*'
    );
  }
}
