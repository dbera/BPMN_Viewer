import { TextFieldEntry } from '@bpmn-io/properties-panel';
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { simpleTypes } from '../../../constant';

export default function ValueExtensionProps(props) {

    const {
        extension,
        element,
        idPrefix,
        type
    } = props;

    const entries = []
    if (!simpleTypes.includes(type)) {
        entries.push(
            {
                id: idPrefix + '-record',
                component: Record,
                extension,
                idPrefix,
                element,
                isEdited: isSelectEntryEdited
            }
        );
    } else {
        entries.push(
            {
                id: idPrefix + '-value',
                component: Value,
                extension,
                idPrefix,
                element,
                isEdited: isSelectEntryEdited
            }
        );
    }
    return entries;
}

function Record(props) {
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
                value: value
            }
        });
    };
    const getValue = (extension) => {
        return extension.value;
    };
    const paramId = extension.$parent.$parent.id;
    const dataObjectRoot = getDataObjectRoot(extension);
    const [params, setParams] = useState([]);
    useEffect(() => {
        function fetchParams() {
            var paramsList = [];
            dataObjectRoot.extensionElements?.values.forEach(function (ext) {
                ext.values.forEach(function (p) {
                    if (p.id !== paramId) {
                        paramsList.push(p.name);
                    }
                });
            });
            setParams(paramsList);
        }
        fetchParams();
    }, [setParams]);

    const getOptions = () => {
        return [
            { label: '<none>', value: undefined },
            ...params.map(param => ({
                label: param,
                value: param
            }))
        ];
    }

    return <SelectEntry
        id={idPrefix + '-parameter'}
        element={extension}
        description={translate('Select a parameter')}
        label={translate('Value')}
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
        extension,
        field
    } = props;
    const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: extension,
            properties: {
                value: value
            }
        });
    };
    const getValue = (extension) => {
        return extension.value;
    };

    return TextFieldEntry({
        element: extension,
        id: idPrefix + '-value',
        getValue,
        setValue,
        debounce
    });

}

function getDataObjectRoot(context) {
    if (is(context, ['bpmn:DataObjectReference'])) {
        return context;
    } else {
        return getDataObjectRoot(context.$parent);
    }
}