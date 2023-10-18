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
      element,
      idPrefix,
      isEdited: isSelectEntryEdited
    }
  ];

  return entries;
}

function Key(props) {
  const {
    idPrefix,
    element,
    extension,
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
    extension,
    element,
    idPrefix,
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput'),
    elementRegistry = useService('elementRegistry'),
    parentType = extension.parentType;
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
  const schema = elementRegistry.filter(function (element) {
    return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
  });
  const [types, setTypes] = useState([]);
  useEffect(() => {
    function fetchTypes() {
      var typeSchema = ['String', 'Int', 'Boolean', 'Float'];
      schema.forEach(function (data) {
        data.businessObject.extensionElements.values.forEach(function (extension) {
          extension.values.forEach(function (type) {
            if (type.name !== parentType) {
              switch (type.type) {
                case 'Record':
                  const subTypes = [];
                  type.extensions?.extensions.forEach(function (subType) {
                    if (subType.record !== undefined) {
                      subTypes.push(subType.key + ':' + subType.record);
                    } else {
                      subTypes.push(subType.key + ':' + subType.type);
                    }
                  });
                  const subTypeslabel = '(' + subTypes.join(", ") + ')';
                  typeSchema.push(type.name + ':' + type.type + subTypeslabel);
                  break;
                case 'List':
                  var label = '';
                  if (type.subType === 'Record') {
                    label = ':' + type.record;
                  }
                  typeSchema.push(type.name + ':' + type.type + '<' + type.subType + label + '>');
                  break;
                case 'Set':
                  typeSchema.push(type.name + ':' + type.type + '<' + type.subType + '>');
                  break;
                case 'Map':
                  typeSchema.push(type.name + ':' + type.type + '<' + type.key + ', ' + type.value + '>');
                  break;
                default:
                  typeSchema.push(type.name + ':' + type.type);
              }
            }
          });
        });
      });
      setTypes(typeSchema);
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
  />;

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
    return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
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
