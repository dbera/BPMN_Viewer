import { isTextFieldEntryEdited, TextFieldEntry, isTextAreaEntryEdited, TextAreaEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { is } from 'bpmn-js/lib/util/ModelUtil';
export default function (element) {
  const entries = [
    {
      id: 'expression',
      element,
      component: Expression,
      isEdited: isTextAreaEntryEdited
    }
  ];
  if (is(element, 'bpmn:DataInputAssociation') ||
    is(element, 'bpmn:DataObjectReference')) {
    entries.push({
      id: 'name',
      element,
      component: Name,
      isEdited: isTextFieldEntryEdited
    });
  }

  return entries;
}

function Expression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.expression || '';
  }

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      expression: value
    });
  }

  return TextAreaEntry({
    element: element,
    id: id + '-name',
    label: translate('Expression'),
    getValue,
    setValue,
    debounce
  });
}

function Name(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.name || '';
  }

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      name: value
    });
  }

  return TextFieldEntry({
    element: element,
    id: id + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}