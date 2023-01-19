import CustomRenderer from './CustomRenderer';
import CustomDrilldown from './CustomDrilldown';
import CustomUtil from './CustomUtil';

export default {
  __init__: [ 'customRenderer', 'customDrilldown' ],
  customRenderer: [ 'type', CustomRenderer ],
  customDrilldown: [ 'type', CustomDrilldown]
};