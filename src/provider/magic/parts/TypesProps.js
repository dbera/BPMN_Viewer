import {
    getBusinessObject
  } from 'bpmn-js/lib/util/ModelUtil';
  
  import { 
    createElement,
    createTypes,
    getTypes,
    getTypesExtension,
    nextId
  } from '../util';
  
  import TypeProps from './TypeProps';
  
  import { without } from 'min-dash';
  
  
  export default function TypesProps({ element, injector }) {
  
    const types = getTypes(element) || [];
  
    const bpmnFactory = injector.get('bpmnFactory'),
          commandStack = injector.get('commandStack');
  
    const items = types.map((type, index) => {
      const id = element.id + '-type-' + index;
  
      return {
        id,
        label: type.get('name') || type.get('id') || '',
        entries: TypeProps({
          idPrefix: id,
          element,
          type
        }),
        autoFocusEntry: id + '-name',
        remove: removeFactory({ commandStack, element, type })
      };
    });
  
    return {
      items,
      add: addFactory({ element, bpmnFactory, commandStack })
    };
  }
  
  function removeFactory({ commandStack, element, type }) {
    return function(event) {
      event.stopPropagation();
  
      const extension = getTypesExtension(element);
  
      if (!extension) {
        return;
      }
  
      const types = without(extension.get('values'), type);
  
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extension,
        properties: {
          values: types
        }
      });
    };
  }
  
  function addFactory({ element, bpmnFactory, commandStack }) {
    return function(event) {
      event.stopPropagation();
  
      const commands = [];
  
      const businessObject = getBusinessObject(element);
  
      let extensionElements = businessObject.get('extensionElements');
  
      // (1) ensure extension elements
      if (!extensionElements) {
        extensionElements = createElement(
          'bpmn:ExtensionElements',
          { values: [] },
          businessObject,
          bpmnFactory
        );
  
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: businessObject,
            properties: { extensionElements }
          }
        });
      }
  
      // (2) ensure types extension
      let extension = getTypesExtension(element);
  
      if (!extension) {
        extension = createTypes({
          values: []
        }, extensionElements, bpmnFactory);
  
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: extensionElements,
            properties: {
              values: [ ...extensionElements.get('values'), extension ]
            }
          }
        });
      }
  
      // (3) create type
      const newType = createElement('magic:Type', {
        id: nextId('Types_'),
        type: ''
      }, extension, bpmnFactory);
  
      // (4) add type to list
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extension,
          properties: {
            values: [ ...extension.get('values'), newType ]
          }
        }
      });
  
      commandStack.execute('properties-panel.multi-command-executor', commands);
    };
  }
  