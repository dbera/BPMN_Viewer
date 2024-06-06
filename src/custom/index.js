import CustomDrilldown from './CustomDrilldown';
import CustomConnRenderer from './CustomConnRenderer';
import CustomLabel from './CustomLabel';
import CustomContextPad from './CustomContextPad';
import CustomPaletteProvider from './CustomPaletteProvider';

export default {
  __init__: ['customDrilldown', 'customConnRenderer', 'customLabel', 'customContextPad', 'paletteProvider'],
  // customRenderer: ['type', CustomRenderer], for custom render shape
  customDrilldown: ['type', CustomDrilldown],
  customConnRenderer: ['type', CustomConnRenderer],
  customLabel: ['type', CustomLabel],
  customContextPad: [ 'type', CustomContextPad ],
  paletteProvider: ['type', CustomPaletteProvider]
};