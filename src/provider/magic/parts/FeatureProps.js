import { isTextAreaEntryEdited, TextAreaEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
export default function (element) {
  const entries = [
    {
      id: 'expression',
      element,
      component: Expression,
      isEdited: isTextAreaEntryEdited
    }
  ];
  return entries;
}

function Expression(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.featureExpression || '';
  }

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      featureExpression: value
    });
  }

  return TextAreaEntry({
    element: element,
    id: id + '-expression',
    label: translate('Feature Expression'),
    getValue,
    setValue,
    debounce
  });
}