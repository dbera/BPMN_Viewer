import { isTextFieldEntryEdited, TextFieldEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function(element) {
    return [
      {
        id: 'name',
        element,
        component: Name,
        isEdited: isTextFieldEntryEdited
      }
    ];
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