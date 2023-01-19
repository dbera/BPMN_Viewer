import { TextFieldEntry } from '@bpmn-io/properties-panel';
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function ExtensionProps(props) {

  const {
    extension,
    element,
    idPrefix
  } = props;

  const entries = [
    {
      id: idPrefix + '-key',
      component: Key,
      extension,
      idPrefix,
      element
    },
    {
      id: idPrefix + '-type',
      component: Type,
      extension,
      idPrefix,
      element,
      isEdited: isSelectEntryEdited
    }
  ];

  return entries;
}

function Key(props) {
  const {
    idPrefix,
    element,
    extension
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extension,
      properties: {
        key: value
      }
    });
  };

  const getValue = () => {
    return extension.key;
  };

  return TextFieldEntry({
    element: extension,
    id: idPrefix + '-key',
    label: translate('Key'),
    getValue,
    setValue,
    debounce
  });
}

function Type(props){
  const {
    idPrefix,
    element,
    extension
  } = props;
  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');
  
  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extension,
        properties: {
          type: value
        }
    });
  };
  const getValue = (extension) => {
    return extension.type;
  };

  const [ types, setTypes ] = useState([]);
  useEffect(() => {
    function fetchTypes(){
        setTypes(['Record', 'List', 'Set', 'Map', 'String', 'Int', 'Boolean', 'Float']);
    }
    fetchTypes();
  }, [ setTypes ]);

  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...types.map(type => ({
        label: type,
        value: type
      }))
    ];
  }

  return <SelectEntry
    id={ idPrefix + '-type' }
    element={ extension }
    description={ translate('Select a type') }
    label={ translate('Type') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
    debounce={ debounce }
  />

}
