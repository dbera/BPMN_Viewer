import {
    isTextFieldEntryEdited, TextFieldEntry, ListGroup, ListItem
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { isBasicType, getDataParameters } from '../util';
import { is } from 'bpmn-js/lib/util/ModelUtil';
export default function StepProps({ element, injector, translate }) {

    var inputData = [];
    var outputData = [];
    var inputEventData = [];
    var outputEventData = [];
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
    element.businessObject.incoming?.forEach(dataInput => {
        var source = dataInput.sourceRef;
        if (source != undefined) {
            getDataParameters(source, elementRegistry).map(p => inputEventData.push(p));
        }
    });
    element.businessObject.outgoing?.forEach(dataOutput => {
        var target = dataOutput.targetRef;
        if (target != undefined) {
            getDataParameters(target, elementRegistry).map(p => outputEventData.push(p));
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
            label: translate('Step Data Input'),
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
            label: translate('Step Data Output'),
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
        },
        {
            id: 'stepEventInput-group',
            label: translate('Step Event Input'),
            component: ListGroup,
            items: inputEventData.map(function (p, index) {
                const id = `${element.id}-stepEventInput-${index}`
                return StepEventInput({
                    id,
                    element,
                    p,
                    injector
                });
            }),
            shouldSort: false
        },
        {
            id: 'stepEventOutput-group',
            label: translate('Step Event Output'),
            component: ListGroup,
            items: outputEventData.map(function (p, index) {
                const id = `${element.id}-stepEventOutput-${index}`
                return StepEventOutput({
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
    let type = p.type;
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

function StepEventInput(props) {
    const { id, p, injector } = props;
    let type = p.type;
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
    let type = p.type;
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

function StepEventOutput(props) {
    const { id, p, injector } = props;
    let type = p.type;
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
        let fields = [];
        let field = "";

        if (subType.startsWith("Record")) {
            field = subType.substr(6, subType.length - 2);
        } else if (subType.startsWith("Set")) {
            field = subType.substr(3, subType.length - 2);
            field = field.replace("<", "").replace(">", "").trim();
        } else if (subType.startsWith("List")) {
            field = subType.substr(4, subType.length - 2);
            field = field.replace("<", "").replace(">", "").trim();
        } else if (subType.startsWith("Map")) {
            field = subType.substr(3, subType.length - 2);
            field = field.replace("<", "").replace(">", "").trim();
        }

        if (field.includes("Record")) {
            let regex = /:Record\(.*?\)/g;
            field = field.replaceAll(regex, "");
        }
        field = field.replace("(", "").replace(")", "").trim();
        fields = field.split(",");
        fields.map((f) => {
            let t = f.trim();
            if (f.includes(":")) {
                t = f.split(":")[1];
            }
            if (isBasicType(t)) {
                entries.push({
                    id: `${id}-field`,
                    label: `${f}`,
                    component: ListItem
                });
            } else {
                let subTypes = getTypeDef(t, injector);
                if (subTypes !== "") {
                    entries.push({
                        id: `${id}-field`,
                        label: `${f}`,
                        component: ListItem,
                        entries: getEntries(subTypes, id, injector)
                    });
                }
            }
        });

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