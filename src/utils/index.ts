// check function type - pure, view - call; else - send
export const getMethodName = (methodType: any): any => {
  if (!methodType) return;

  let types = {
    default: 'send',
    pure: 'call',
    view: 'call'
  };

  return types[methodType] || types['default'];
};