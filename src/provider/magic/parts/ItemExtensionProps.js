import { TextAreaEntry, isTextAreaEntryEdited } from "@bpmn-io/properties-panel";
import { useService } from 'bpmn-js-properties-panel';
export default function ItemExtensionProps(props) {
    const {
        extension,
        element,
        idPrefix
    } = props;

    return [
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

function Value(props) {
    const {
        idPrefix,
        element,
        extension,
    } = props;
    const commandStack = useService('commandStack'),
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
        getValue,
        setValue,
        debounce
    });

}