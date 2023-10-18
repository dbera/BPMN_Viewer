import { TextFieldEntry, TextAreaEntry, isTextAreaEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function StepDataRefProps(props) {
    const {
        idPrefix,
        ref
    } = props;
    const entries = [
        {
            id: idPrefix + '-var',
            component: Variable,
            idPrefix,
            stepDataRef: ref,
        },
        {
            id: idPrefix + '-value',
            component: Value,
            idPrefix,
            stepDataRef: ref,
            isEdited: isTextAreaEntryEdited
        }
    ];

    return entries;
}

function Variable(props) {
    const {
        idPrefix,
        element,
        stepDataRef
    } = props;

    const commandStack = useService('commandStack');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: stepDataRef,
            properties: {
                variable: value
            }
        });
    };

    const getValue = (stepDataRef) => {
        return stepDataRef.variable;
    };

    return TextFieldEntry({
        element: stepDataRef,
        id: idPrefix + '-var',
        label: translate('Variable'),
        getValue,
        setValue,
        debounce
    });
}

function Value(props) {
    const {
        idPrefix,
        element,
        stepDataRef
    } = props;

    const commandStack = useService('commandStack');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const setValue = (val) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: stepDataRef,
            properties: {
                value: val
            }
        });
    };

    const getValue = (stepDataRef) => {
        return stepDataRef.value;
    };

    return TextAreaEntry({
        element: stepDataRef,
        id: idPrefix + '-value',
        label: translate('Value'),
        getValue,
        setValue,
        debounce
    });
}