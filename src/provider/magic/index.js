import MagicPropertiesProvider from './MagicPropertiesProvider';
import DisabledPopupProvider from './DisabledPopupProvider';

export default {
  __init__: [ 'magicPropertiesProvider', 'disabledPopupProvider' ],
  magicPropertiesProvider: [ 'type', MagicPropertiesProvider ],
  disabledPopupProvider: ['type', DisabledPopupProvider ]
};