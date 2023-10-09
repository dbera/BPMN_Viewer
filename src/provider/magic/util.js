import Ids from 'ids';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';
export function getParametersExtension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'magic:Parameters');
}

export function getTypesExtension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'magic:Types');
}

export function getParameters(element) {
  const parameters = getParametersExtension(element);
  return parameters && parameters.get('values');
}

export function getTypes(element) {
  const types = getTypesExtension(element);
  return types && types.get('values');
}

export function getExtension(element, type) {
  if (!element.extensionElements) {
    return null;
  }

  return element.extensionElements.values.filter(function (e) {
    return e.$instanceOf(type);
  })[0];
}

export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

export function createParameters(properties, parent, bpmnFactory) {
  return createElement('magic:Parameters', properties, parent, bpmnFactory);
}

export function createTypes(properties, parent, bpmnFactory) {
  return createElement('magic:Types', properties, parent, bpmnFactory);
}

export function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix);
}

export function isBasicType(t) {
  if (t == "String" ||
    t == "Int" ||
    t == "Boolean" ||
    t == "Float") {
    return true;
  } else {
    return false;
  }
}