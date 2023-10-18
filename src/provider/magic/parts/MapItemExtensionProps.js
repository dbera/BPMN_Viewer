import { TextAreaEntry, isTextAreaEntryEdited } from "@bpmn-io/properties-panel";
import { useService } from 'bpmn-js-properties-panel';
export default function MapItemExtensionProps(props) {
    const {
        extension,
        element,
        idPrefix
    } = props;

    return [
        {
            id: idPrefix + '-key',
            component: Key,
            extension,
            idPrefix,
            element
        },
        {
            id: idPrefix + 'value',
            element,
            extension,
            component: Value,
            idPrefix,
            isEdited: isTextAreaEntryEdited
        }
    ];
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

    return TextAreaEntry({
        element: extension,
        id: idPrefix + '-key',
        label: translate('Key'),
        getValue,
        setValue,
        debounce
    });
}

function Value(props) {
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
                value: value
            }
        });
    };
    const getValue = (extension) => {
        return extension.value;
    };

    return TextAreaEntry({
        element: extension,
        id: idPrefix + '-value',
        label: translate('Value'),
        getValue,
        setValue,
        debounce
    });

}