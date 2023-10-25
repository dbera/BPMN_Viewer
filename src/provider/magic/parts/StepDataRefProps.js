import { TextFieldEntry, TextAreaEntry, isTextAreaEntryEdited, SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from 'bpmn-js-properties-panel';
import { getDataParameters } from '../util';
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
            isEdited: isSelectEntryEdited
        },
        {
            id: idPrefix + '-field',
            component: Field,
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
    const elementRegistry = useService('elementRegistry');
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
    var dataList = [];
    element.businessObject.dataInputAssociations?.forEach(dataInput => {
        var source = dataInput.sourceRef[0];
        if (source != undefined) {
            getDataParameters(source, elementRegistry).map(p => dataList.push(p.name));
        }
    });
    element.businessObject.dataOutputAssociations?.forEach(dataOutput => {
        var target = dataOutput.targetRef;
        if (target != undefined) {
            getDataParameters(target, elementRegistry).map(p => dataList.push(p.name));
        }
    });
    element.businessObject.incoming?.forEach(dataInput => {
        var source = dataInput.sourceRef;
        if (source != undefined) {
            getDataParameters(source, elementRegistry).map(p => dataList.push(p.name));
        }
    });
    element.businessObject.outgoing?.forEach(dataOutput => {
        var target = dataOutput.targetRef;
        if (target != undefined) {
            getDataParameters(target, elementRegistry).map(p => dataList.push(p.name));
        }
    });
    const [variables, setVariables] = useState([]);
    useEffect(() => {
        function fetchVariables() {
            setVariables(dataList);
        }
        fetchVariables();
    }, [setVariables]);
    const getOptions = () => {
        return [
            { label: '<none>', value: undefined },
            ...variables.map(variable => ({
                label: variable,
                value: variable
            }))
        ];
    }
    return SelectEntry({
        element: stepDataRef,
        id: idPrefix + '-var',
        description: translate('Select a variable'),
        label: translate('Variable'),
        getValue: getValue,
        setValue: setValue,
        getOptions: getOptions,
        debounce: debounce
    });

}
function Field(props) {
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
                field: value
            }
        });
    };

    const getValue = (stepDataRef) => {
        return stepDataRef.field;
    };

    return TextFieldEntry({
        element: stepDataRef,
        id: idPrefix + '-field',
        label: translate('Field'),
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