import CustomRenderer from './CustomRenderer';
import CustomDrilldown from './CustomDrilldown';
import CustomConnRenderer from './CustomConnRenderer';
import CustomLabel from './CustomLabel';
export default {
  __init__: ['customDrilldown', 'customConnRenderer', 'customLabel'],
  // customRenderer: ['type', CustomRenderer], for custom render shape
  customDrilldown: ['type', CustomDrilldown],
  customConnRenderer: ['type', CustomConnRenderer],
  customLabel: ['type', CustomLabel]
};