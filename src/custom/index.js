import CustomDrilldown from './CustomDrilldown';
import CustomConnRenderer from './CustomConnRenderer';
import CustomLabel from './CustomLabel';
import CustomPaletteProvider from './CustomPaletteProvider';

export default {
  __init__: ['customDrilldown', 'customConnRenderer', 'customLabel', 'paletteProvider'],
  // customRenderer: ['type', CustomRenderer], for custom render shape
  customDrilldown: ['type', CustomDrilldown],
  customConnRenderer: ['type', CustomConnRenderer],
  customLabel: ['type', CustomLabel],
  paletteProvider: ['type', CustomPaletteProvider]
};