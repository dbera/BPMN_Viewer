import { TextFieldEntry, SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useService } from 'bpmn-js-properties-panel';

//import ExtensionList from './ExtensionList';


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
    {
      id: idPrefix + '-value',
      component: Value,
      idPrefix,
      parameter
    }
  ];

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
  const schema = elementRegistry.filter(function(element) {
      return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget; 
      //element.businessObject.name === 'Schema' && 
  });
  const [ types, setTypes ] = useState([]);
  useEffect(() => {
    function fetchTypes(){
      var typeSchema = [];
      console.log(schema);
      schema.forEach(function(data){
        data.businessObject.extensionElements.values.forEach(function(extension){
          extension.values.forEach(function(type){
            switch (type.type){
              case 'Record': 
                const subTypes = [];
                type.extensions?.extensions.forEach(function(subType){
                  subTypes.push(subType.key + ':'+subType.type);
                });
                const subTypeslabel = '(' + subTypes.join(", ")+ ')';
                typeSchema.push(type.name+':'+ type.type + subTypeslabel);
                break;
              case 'List':
                var label = '';
                if (type.subType === 'Record'){
                  label = ':' + type.record;
                }
                typeSchema.push(type.name+':'+ type.type + '<' + type.subType+label+'>');
                break;
              case 'Set':
                typeSchema.push(type.name+':'+ type.type + '<' + type.subType+ '>');
                break;
              case 'Map':
                typeSchema.push(type.name+':'+ type.type + '<' + type.key +', '+ type.value+'>');
                break;
              default:
                typeSchema.push(type.name+':'+ type.type);
            }
          });
        })
      });
      setTypes(typeSchema);
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
    element={ parameter }
    description={ translate('Select a defined type') }
    label={ translate('Type') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
    debounce={ debounce }
  />
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

  return TextFieldEntry({
    element: parameter,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}