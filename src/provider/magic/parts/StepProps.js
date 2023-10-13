import {
    isTextFieldEntryEdited, TextFieldEntry, ListGroup, ListItem
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { isBasicType } from '../util';
import { is } from 'bpmn-js/lib/util/ModelUtil';
// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import stepDataRefListProps from './StepDataRefListProps';
import StepDataRefListProps from './StepDataRefListProps';
export default function StepProps({ element, injector, translate }) {

    var inputData = [];
    var outputData = [];
    const elementRegistry = injector.get('elementRegistry');
    element.businessObject.dataInputAssociations?.forEach(dataInput => {
        var source = dataInput.sourceRef[0];
        if (source != undefined) {
            getDataParameters(source, elementRegistry).map(p => inputData.push(p));
        }
    });
    element.businessObject.dataOutputAssociations?.forEach(dataOutput => {
        var target = dataOutput.targetRef;
        if (target != undefined) {
            getDataParameters(target, elementRegistry).map(p => outputData.push(p));
        }
    });

    return [
        {
            id: 'stepType',
            element,
            component: StepType,
            isEdited: isTextFieldEntryEdited
        },
        {
            id: 'stepInput-group',
            label: translate('Step Input'),
            component: ListGroup,
            items: inputData.map(function (p, index) {
                const id = `${element.id}-stepInput-${index}`
                return StepInput({
                    id,
                    element,
                    p,
                    injector
                });
            }),
            shouldSort: false
        },
        {
            id: 'stepOutput-group',
            label: translate('Step Output'),
            component: ListGroup,
            items: outputData.map(function (p, index) {
                const id = `${element.id}-stepOutput-${index}`
                return StepOutput({
                    id,
                    element,
                    p,
                    injector
                });
            }),
            shouldSort: false
        }
    ];
}

function StepType(props) {
    const { element, id } = props;

    const modeling = useService('modeling');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const getValue = () => {
        return element.businessObject.stepType || '';
    }

    const setValue = (value) => {
        return modeling.updateProperties(element, {
            stepType: value
        });
    }

    return TextFieldEntry({
        element: element,
        id: id + '-stepType',
        label: translate('Step Type'),
        getValue,
        setValue,
        debounce
    });
}

function StepInput(props) {
    const { id, p, injector } = props;
    console.log(p)
    let type = p.type.split(/:(.*)/s)[0];
    let subType = p.type.split(/:(.*)/s)[1];
    let entries = [];

    if (subType.includes("Record")) {
        getEntries(subType, id, injector).map(function (e) {
            entries.push(e);
        });
    } else {
        entries = [
            {
                id: `${id}-subType`,
                label: `${subType}`,
                component: ListItem,
            },
        ]
    }
    return {
        id,
        label: `${p.name} : ${type}`,
        entries: entries
    };
}

function StepOutput(props) {
    const { id, p, injector } = props;
    let type = p.type.split(/:(.*)/s)[0];
    let subType = p.type.split(/:(.*)/s)[1];
    let entries = [];

    if (subType.includes("Record")) {
        getEntries(subType, id, injector).map(function (e) {
            entries.push(e);
        });
    } else {
        entries = [
            {
                id: `${id}-subType`,
                label: `${subType}`,
                component: ListItem,
            },
        ]
    }
    return {
        id,
        label: `${p.name} : ${type}`,
        entries: entries
    };
}

function getEntries(subType, id, injector) {
    let entries = [];
    if (subType !== undefined) {
        if (subType.includes("Record")) {
            let regex = /\((.*?)\)/;
            let fields = regex.exec(subType)[1].split(",");
            fields.map((f) => {
                const t = f.split(":")[1]
                if (isBasicType(t)) {
                    entries.push({
                        id: `${id}-field`,
                        label: `${f}`,
                        component: ListItem
                    });
                } else {
                    let field = getTypeDef(t, injector);
                    entries.push({
                        id: `${id}-field`,
                        label: `${f}`,
                        component: ListItem,
                        entries: getEntries(field, id, injector)
                    });
                }
            });
        }

    }
    return entries;
}

function getTypeDef(type, injector) {
    const elementRegistry = injector.get('elementRegistry');
    const schema = elementRegistry.filter(function (element) {
        return element.businessObject.name === 'Schema' &&
            is(element, ['bpmn:DataStoreReference']) && !element.labelTarget;
    });
    let typeDef = ""
    schema.forEach(function (data) {
        data.businessObject.extensionElements.values.forEach(function (extension) {
            extension.values.forEach(function (t) {
                if (type === t.name) {
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
                            typeDef = t.type + subTypeslabel;
                    }
                }
            });
        });
    });
    return typeDef;
}

function getDataParameters(source, elementRegistry) {
    let dataParams = [];
    source?.extensionElements?.values.map(function (extension) {
        extension.values.map(function (p) {
            dataParams.push(p);
        });
    });
    if (source.linkedSupDataId != undefined) {
        var data = elementRegistry.get(source.linkedSupDataId);
        getDataParameters(data?.businessObject, elementRegistry).map(p =>
            dataParams.push(p));
    }
    return dataParams;
}