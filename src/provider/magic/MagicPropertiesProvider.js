// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.
import spellProps from './parts/SpellProps';
import guardProps from './parts/GuardProps';
import parametersProps from './parts/ParametersProps';
import typesProps from './parts/TypesProps';
import { is } from 'bpmn-js/lib/util/ModelUtil';
// Import the properties panel list group component.
import { ListGroup } from '@bpmn-io/properties-panel';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function MagicPropertiesProvider(propertiesPanel, injector, translate) {

  // API ////////

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function(groups) {

      // Add the "magic" group
      if(is(element, 'bpmn:DataStoreReference')) {
        groups.push(createTypesGroup(element, injector, translate));
      }

      if(is(element, 'bpmn:DataOutputAssociation')) {
        groups.push(createExtensionGroup(element, translate));
      }

      if(is(element, 'bpmn:DataInputAssociation')) {
        groups.push(createExtensionGroup(element, translate));
      }
      if(is(element, 'bpmn:DataObjectReference')){
        groups.push(createParametersGroup(element, injector, translate));
      }

      return groups;
    }
  };


  // registration ////////

  // Register our custom magic properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

MagicPropertiesProvider.$inject = [ 'propertiesPanel', 'injector', 'translate' ];

// Create the custom magic group
function createMagicGroup(element, translate) {

  // create a group called "Magic properties".
  const magicGroup = {
    id: 'magic',
    label: translate('Magic properties'),
    entries: spellProps(element)
  };

  return magicGroup
}

function createExtensionGroup(element, translate) {
  const extensionGroup = {
    id: 'extension',
    label: translate('Data Extensions'),
    entries: guardProps(element)
  };
  return extensionGroup
}

// Create the custom parameters list group.
function createParametersGroup(element, injector, translate) {

  // Create a group called "parameters".
  const parametersGroup = {
    id: 'parameters',
    label: translate('Data parameters'),
    component: ListGroup,
    ...parametersProps({ element, injector })
  };

  return parametersGroup;
}

//create the custom type schema group.
function createTypesGroup(element, injector, translate) {
  const typesGroup = {
    id: 'types',
    label: translate('Data Schema'),
    component: ListGroup,
    ...typesProps({ element, injector })
  };

  return typesGroup;
}
