import { isSelectEntryEdited, SelectEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { is } from 'bpmn-js/lib/util/ModelUtil';
export default function (element) {
    return [
        {
            id: 'objectType',
            element,
            component: Type,
            isEdited: isSelectEntryEdited
        }
    ];
}

function Type(props) {
    const {
        idPrefix,
        element,
    } = props;

    const elementRegistry = useService('elementRegistry');
    const modeling = useService('modeling');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const setValue = (value) => {
        return modeling.updateProperties(element, {
            objectType: value
        });
    };

    const getValue = (element) => {
        return element.businessObject.objectType;
    };
    const schema = elementRegistry.filter(function (element) {
        return is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
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
        element: element,
        id: idPrefix + '-type',
        description: translate('Select a defined type'),
        label: translate('Object Type'),
        getValue: getValue,
        setValue: setValue,
        getOptions: getOptions,
        debounce: debounce
    });
}