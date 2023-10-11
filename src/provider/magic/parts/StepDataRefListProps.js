import {
    getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import StepDataRefProps from './StepDataRefProps';
import {
    createElement,
    createRefs,
    getDataRefs,
    getDataRefListExtension,
    nextId
} from '../util';
import { without } from 'min-dash';
export default function StepDataRefListProps({ element, injector }) {

    const refs = getDataRefs(element) || [];

    const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

    const items = refs.map((ref, index) => {
        const id = element.id + '-ref-' + index;

        return {
            id,
            label: ref.get('variable') || ref.get('id') || '',
            entries: StepDataRefProps({
                idPrefix: id,
                element,
                ref
            }),
            autoFocusEntry: id + '-var',
            remove: removeFactory({ commandStack, element, ref })
        };
    });

    return {
        items,
        add: addFactory({ element, bpmnFactory, commandStack })
    };
}

function removeFactory({ commandStack, element, ref }) {
    return function (event) {
        event.stopPropagation();

        const extension = getDataRefListExtension(element);

        if (!extension) {
            return;
        }

        const refs = without(extension.get('values'), ref);
        console.log("remove")
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: extension,
            properties: {
                values: refs
            }
        });
    };
}

function addFactory({ element, bpmnFactory, commandStack }) {
    return function (event) {
        event.stopPropagation();
        const commands = [];

        const businessObject = getBusinessObject(element);

        let extensionElements = businessObject.get('extensionElements');

        // (1) ensure extension elements
        if (!extensionElements) {
            extensionElements = createElement(
                'bpmn:ExtensionElements',
                { values: [] },
                businessObject,
                bpmnFactory
            );

            commands.push({
                cmd: 'element.updateModdleProperties',
                context: {
                    element,
                    moddleElement: businessObject,
                    properties: { extensionElements }
                }
            });
        }

        // (2) ensure Data Ref extension
        let extension = getDataRefListExtension(element);

        if (!extension) {
            extension = createRefs({
                values: []
            }, extensionElements, bpmnFactory);

            commands.push({
                cmd: 'element.updateModdleProperties',
                context: {
                    element,
                    moddleElement: extensionElements,
                    properties: {
                        values: [...extensionElements.get('values'), extension]
                    }
                }
            });
        }

        // (3) create ref
        const newRef = createElement('magic:StepDataRef', {
            id: nextId('StepDataRef_'),
            variable: '',
            value: ''
        }, extension, bpmnFactory);

        // (4) add ref to list
        commands.push({
            cmd: 'element.updateModdleProperties',
            context: {
                element,
                moddleElement: extension,
                properties: {
                    values: [...extension.get('values'), newRef]
                }
            }
        });

        commandStack.execute('properties-panel.multi-command-executor', commands);
    };
} 