import { isTextFieldEntryEdited, TextFieldEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function(element) {
    return [
      {
        id: 'expression',
        element,
        component: Expression,
        isEdited: isTextFieldEntryEdited
      },
      {
        id: 'name',
        element,
        component: Name,
        isEdited: isTextFieldEntryEdited
      }
    ];
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

    return TextFieldEntry({
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