import { TextFieldEntry, SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useService } from 'bpmn-js-properties-panel';

export default function StepDataRefProps(props) {
    const {
        idPrefix,
        ref
    } = props;
    console.log(ref)
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
    console.log(stepDataRef)
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
        console.log(stepDataRef)
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

    return TextFieldEntry({
        element: stepDataRef,
        id: idPrefix + '-value',
        label: translate('Value'),
        getValue,
        setValue,
        debounce
    });
}