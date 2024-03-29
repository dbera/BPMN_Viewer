import { TextFieldEntry, TextAreaEntry, SelectEntry, isSelectEntryEdited, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { useService } from 'bpmn-js-properties-panel';
import ValueList from './ValueList';
import ItemList from './ItemList';
import MapItemList from './MapItemList';
import { simpleLists, simpleTypes } from '../../../constant';
export default function ParameterProps(props) {

  const {
    idPrefix,
    parameter
  } = props;

  const entries = [
    {
      id: idPrefix + '-name',
      component: Name,
      idPrefix,
      parameter,
    },
    {
      id: idPrefix + '-type',
      component: Type,
      idPrefix,
      parameter,
      isEdited: isSelectEntryEdited
    },

  ];

  if (parameter.type != undefined) {
    let type = parameter.type.split(/:(.*)/s)[1];
    if (type.startsWith("Record")) {
      let fields = [];
      let field = type.substr(6, type.length - 2);
      if (field.includes("Record")) {
        let regex = /:Record\(.*?\)/g;
        field = field.replaceAll(regex, "");
      }
      field = field.replace("(", "").replace(")", "").trim();
      fields = field.split(",");
      entries.push(
        {
          id: idPrefix + '-value',
          component: ValueList,
          idPrefix,
          parameter,
          fields
        }
      );
    } else if (type.startsWith("List")) {
      let regex = /<(.*?)>/;
      let item = regex.exec(parameter.type)[1];
      entries.push(
        {
          id: idPrefix + '-item',
          component: ItemList,
          idPrefix,
          parameter,
          item,
          shouldSort: false
        }
      );
    } else if (type.startsWith("Map")) {
      entries.push(
        {
          id: idPrefix + '-map',
          component: MapItemList,
          idPrefix,
          parameter,
          shouldSort: false
        }
      );
    } else if (type.startsWith("Set")) {
      let regex = /<(.*?)>/;
      let item = regex.exec(parameter.type)[1];
      entries.push(
        {
          id: idPrefix + '-item',
          component: ItemList,
          idPrefix,
          parameter,
          item,
          shouldSort: false
        }
      );
    }

    if (simpleTypes.includes(type)) {
      entries.push(
        {
          id: idPrefix + '-value',
          component: Value,
          idPrefix,
          parameter
        }
      );
    }

    if (simpleLists.includes(type)) {
      entries.push(
        {
          id: idPrefix + '-value',
          component: Value,
          idPrefix,
          parameter,
          isEdited: isTextAreaEntryEdited
        }
      );
    }

  }

  return entries;
}

function Name(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        name: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.name;
  };

  return TextFieldEntry({
    element: parameter,
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
    parameter
  } = props;

  const elementRegistry = useService('elementRegistry');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        type: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.type;
  };
  const schema = elementRegistry.filter(function (element) {
    return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
    //element.businessObject.name === 'Schema' && 
  });
  const [types, setTypes] = useState([]);
  useEffect(() => {
    function fetchTypes() {
      var typeSchema = [];
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
          });
        })
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
  return SelectEntry({
    element: parameter,
    id: idPrefix + '-type',
    description: translate('Select a defined type'),
    label: translate('Type'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions,
    debounce: debounce
  });
}

function Value(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        value: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.value;
  };

  return TextAreaEntry({
    element: parameter,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}

function Field(props) {
  const {
    idPrefix,
    element,
    parameter,
    name
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (field) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        fieldName: field
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.values;
  };

  return TextFieldEntry({
    element: parameter,
    id: idPrefix + '-value',
    label: translate(name),
    getValue,
    setValue,
    debounce
  });
}