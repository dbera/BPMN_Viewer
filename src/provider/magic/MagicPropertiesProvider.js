// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.
import guardProps from './parts/GuardProps';
import featureProps from './parts/FeatureProps';
import parametersProps from './parts/ParametersProps';
import typesProps from './parts/TypesProps';
import stepProps from './parts/StepProps';
import ObjectTypeProps from './parts/ObjectTypeProps';
import { is } from 'bpmn-js/lib/util/ModelUtil';
// Import the properties panel list group component.
import { ListGroup } from '@bpmn-io/properties-panel';
import stepDataRefListProps from './parts/StepDataRefListProps';

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
  this.getGroups = function (element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function (groups) {

      // Add the "magic" group
      if (is(element, 'bpmn:DataStoreReference')) {
        groups.push(createTypesGroup(element, injector, translate));
      }

      if (is(element, 'bpmn:DataOutputAssociation')) {
        groups.push(createExtensionGroup(element, translate));
      }

      if (is(element, 'bpmn:DataInputAssociation')) {
        groups.push(createExtensionGroup(element, translate));
      }
      if (is(element, 'bpmn:DataObjectReference')) {
        groups.push(createDataTypeGroup(element, translate));
        groups.push(createParametersGroup(element, injector, translate));
      }

      if (is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {
        if (is(element.businessObject.eventDefinitions[0], 'bpmn:MessageEventDefinition') ||
          is(element.businessObject.eventDefinitions[0], 'bpmn:SignalEventDefinition') ||
          is(element.businessObject.eventDefinitions[0], 'bpmn:TimerEventDefinition')) {
          groups.push(createDataTypeGroup(element, translate));
          groups.push(createParametersGroup(element, injector, translate));
        }
      }

      if (is(element, 'bpmn:Task')) {
        groups.push(createGuardGroup(element, translate));
        groups.push(createFeatureGroup(element, translate));
        groups.push(createStepGroup(element, injector, translate));
        groups.push(createStepDataRefGroup(element, injector, translate));
      }

      if (is(element, 'bpmn:SequenceFlow')) {
        groups.push(createGuardGroup(element, translate));
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

MagicPropertiesProvider.$inject = ['propertiesPanel', 'injector', 'translate'];

// Create the custom Extension group
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

//create the custom step schema group.
function createStepGroup(element, injector, translate) {
  const stepGroup = {
    id: 'step',
    label: translate('Step properties'),
    entries: stepProps({ element, injector, translate })
  };

  return stepGroup;
}

//create the custom step data refs group.
function createStepDataRefGroup(element, injector, translate) {
  const stepDataRefGroup = {
    id: 'dataRefs',
    label: translate('Data Reference'),
    component: ListGroup,
    ...stepDataRefListProps({ element, injector, translate })
  }
  return stepDataRefGroup;
}

//create the custom guard group.
function createGuardGroup(element, translate) {
  const guardGroup = {
    id: 'guard',
    label: translate('Guard Extensions'),
    entries: guardProps(element)
  };
  return guardGroup
}

//create the custom feature group.
function createFeatureGroup(element, translate) {
  const featureGroup = {
    id: 'feature',
    label: translate('Feature Extensions'),
    entries: featureProps(element)
  };
  return featureGroup
}

//create the custom DataType group.
function createDataTypeGroup(element, translate) {
  const objectTypeGroup = {
    id: 'dataType',
    label: translate('Data Type'),
    entries: ObjectTypeProps(element)
  };
  return objectTypeGroup
}