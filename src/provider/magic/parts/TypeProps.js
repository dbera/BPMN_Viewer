import { TextFieldEntry } from '@bpmn-io/properties-panel';
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import ExtensionList from './ExtensionList';
import { is } from 'bpmn-js/lib/util/ModelUtil';
export default function TypeProps(props) {

  const {
    idPrefix,
    type
  } = props;

  const entries = [
    {
      id: idPrefix + '-name',
      component: Name,
      idPrefix,
      type
    },
    {
      id: idPrefix + '-type',
      component: Type,
      idPrefix,
      type,
      isEdited: isSelectEntryEdited
    }
  ];

  if (type.type === 'Record') {
    entries.push({
      id: idPrefix + '-extensions',
      component: ExtensionList,
      idPrefix,
      type
    });
  }

  if (type.type === 'List' || type.type === 'Set') {
    type.key = '';
    type.value = '';
    entries.push({
      id: idPrefix + '-subType',
      component: SubType,
      idPrefix,
      type,
      isEdited: isSelectEntryEdited
    });
  }

  if (type.type === 'Map') {
    type.subType = '';
    entries.push({
      id: idPrefix + '-key',
      component: Key,
      idPrefix,
      type,
      isEdited: isSelectEntryEdited
    },
      {
        id: idPrefix + '-value',
        component: Value,
        idPrefix,
        type,
        isEdited: isSelectEntryEdited
      });
  }
  // if (type.subType === 'Record') {
  //   entries.push({
  //     id: idPrefix + '-record',
  //     component: Record,
  //     idPrefix,
  //     type,
  //     isEdited: isSelectEntryEdited
  //   });

  // }
  return entries;
}

function Name(props) {
  const {
    idPrefix,
    element,
    type
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: type,
      properties: {
        name: value
      }
    });
  };

  const getValue = (type) => {
    return type.name;
  };

  return TextFieldEntry({
    element: type,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function Type(props) {
  const {
    idPrefix,
    element,
    type
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: type,
      properties: {
        type: value
      }
    });
  };

  const getValue = (type) => {
    return type.type;
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
    element={type}
    description={translate('Select a type')}
    label={translate('Type')}
    getValue={getValue}
    setValue={setValue}
    getOptions={getOptions}
    debounce={debounce}
  />
}

function SubType(props) {
  const {
    idPrefix,
    element,
    type
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const elementRegistry = useService('elementRegistry');
  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: type,
      properties: {
        subType: value
      }
    });
  };

  const getValue = (type) => {
    return type.subType;
  };
  const schema = elementRegistry.filter(function (element) {
    return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
  });
  const [subtypes, setSubTypes] = useState([]);
  useEffect(() => {
    function fetchTypes() {
      var typeSchema = ['String', 'Int', 'Boolean', 'Float'];
      schema.forEach(function (data) {
        data.businessObject.extensionElements.values.forEach(function (extension) {
          extension.values.forEach(function (t) {
            if (t.name !== type.name) {
              switch (t.type) {
                case 'Record':
                  const subTypes = [];
                  t.extensions?.extensions.forEach(function (subType) {
                    if (subType.record !== undefined) {
                      subTypes.push(subType.key + ':' + subType.record);
                    } else {
                      subTypes.push(subType.key + ':' + subType.type);
                    }
                  });
                  const subTypeslabel = '(' + subTypes.join(", ") + ')';
                  typeSchema.push(t.name + ':' + t.type + subTypeslabel);
                  break;
                case 'List':
                  var label = '';
                  if (t.subType === 'Record') {
                    label = ':' + t.record;
                  }
                  typeSchema.push(t.name + ':' + t.type + '<' + t.subType + label + '>');
                  break;
                case 'Set':
                  typeSchema.push(t.name + ':' + t.type + '<' + t.subType + '>');
                  break;
                case 'Map':
                  typeSchema.push(t.name + ':' + t.type + '<' + t.key + ', ' + t.value + '>');
                  break;
                default:
                  typeSchema.push(t.name + ':' + t.type);
              }
            }
          });
        });
      });
      setSubTypes(typeSchema);
    }
    fetchTypes();
  }, [setSubTypes]);

  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...subtypes.map(subType => ({
        label: subType,
        value: subType
      }))
    ];
  }

  return <SelectEntry
    id={idPrefix + '-type'}
    element={type}
    description={translate('Select a subtype')}
    label={translate('Subtype')}
    getValue={getValue}
    setValue={setValue}
    getOptions={getOptions}
    debounce={debounce}
  />
}

function Key(props) {
  const {
    idPrefix,
    element,
    type
  } = props;
  const elementRegistry = useService('elementRegistry');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: type,
      properties: {
        key: value
      }
    });
  };

  const getValue = (type) => {
    return type.key;
  };
  const schema = elementRegistry.filter(function (element) {
    return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
  });
  const [keys, setKeys] = useState([]);
  useEffect(() => {
    function fetchKeys() {
      var typeSchema = ['String', 'Int', 'Boolean', 'Float'];
      schema.forEach(function (data) {
        data.businessObject.extensionElements.values.forEach(function (extension) {
          extension.values.forEach(function (type) {
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
            }
          });
        });
      });
      setKeys(typeSchema);
    }
    fetchKeys();
  }, [setKeys]);

  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...keys.map(key => ({
        label: key,
        value: key
      }))
    ];
  }

  return <SelectEntry
    id={idPrefix + '-key'}
    element={type}
    description={translate('Select a type for the key')}
    label={translate('Key')}
    getValue={getValue}
    setValue={setValue}
    getOptions={getOptions}
    debounce={debounce}
  />
}

function Value(props) {
  const {
    idPrefix,
    element,
    type
  } = props;
  const elementRegistry = useService('elementRegistry');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (val) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: type,
      properties: {
        value: val
      }
    });
  };

  const getValue = (type) => {
    return type.value;
  };
  const schema = elementRegistry.filter(function (element) {
    return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
  });
  const [values, setValues] = useState([]);
  useEffect(() => {
    function fetchValues() {
      var typeSchema = ['String', 'Int', 'Boolean', 'Float'];
      schema.forEach(function (data) {
        data.businessObject.extensionElements.values.forEach(function (extension) {
          extension.values.forEach(function (type) {
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
            }
          });
        });
      });
      setValues(typeSchema);
    }
    fetchValues();
  }, [setValues]);

  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...values.map(val => ({
        label: val,
        value: val
      }))
    ];
  }

  return <SelectEntry
    id={idPrefix + '-value'}
    element={type}
    description={translate('Select a type for the value')}
    label={translate('Value')}
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
    type
  } = props;
  const elementRegistry = useService('elementRegistry');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (val) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: type,
      properties: {
        record: val
      }
    });
  };

  const getValue = (type) => {
    return type.record;
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
            if (t.type === 'Record' && t.name !== type.name) {
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
    element={type}
    description={translate('Select a record type')}
    label={translate('Record')}
    getValue={getValue}
    setValue={setValue}
    getOptions={getOptions}
    debounce={debounce}
  />
}