import { TextFieldEntry } from '@bpmn-io/properties-panel';
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { is } from 'bpmn-js/lib/util/ModelUtil';
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
  if (extension.type === 'Record') {
    entries.push({
      id: idPrefix + '-record',
      component: Record,
      idPrefix,
      extension,
      isEdited: isSelectEntryEdited
    });
  }
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

function Type(props) {
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

  const [types, setTypes] = useState([]);
  useEffect(() => {
    function fetchTypes() {
      setTypes(['Record', 'List', 'Set', 'Map', 'String', 'Int', 'Boolean', 'Float']);
    }
    fetchTypes();
  }, [setTypes]);

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
    id={idPrefix + '-type'}
    element={extension}
    description={translate('Select a type')}
    label={translate('Type')}
    getValue={getValue}
    setValue={setValue}
    getOptions={getOptions}
    debounce={debounce}
  />

}

function Record(props) {
  const {
    idPrefix,
    element,
    extension
  } = props;
  const elementRegistry = useService('elementRegistry');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (val) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extension,
      properties: {
        record: val
      }
    });
  };

  const getValue = (extension) => {
    return extension.record;
  };
  const schema = elementRegistry.filter(function (element) {
    return element.businessObject.name === 'Schema' &&
      is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
  });
  const [records, setRecords] = useState([]);
  useEffect(() => {
    function fetchRecords() {
      var recordTypes = [];
      schema.forEach(function (data) {
        data.businessObject.extensionElements.values.forEach(function (extension) {
          extension.values.forEach(function (t) {
            if (t.type === 'Record' && t.name !== extension.parentType) {
              recordTypes.push(t.name);
            }
          });
        })
      });
      setRecords(recordTypes);
    }
    fetchRecords();
  }, [setRecords]);

  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...records.map(record => ({
        label: record,
        value: record
      }))
    ];
  }

  return <SelectEntry
    id={idPrefix + '-record'}
    element={extension}
    description={translate('Select a record type')}
    label={translate('Record')}
    getValue={getValue}
    setValue={setValue}
    getOptions={getOptions}
    debounce={debounce}
  />
}
