import { without } from 'min-dash';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import ValueExtensionProps from './ValueExtensionProps';
import {
    CollapsibleEntry,
    ListEntry
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import {
    createElement
} from '../util';

export default function ValueList(props) {
    const {
        element,
        idPrefix,
        parameter,
        fields
    } = props;

    const id = `${idPrefix}-values`;

    const bpmnFactory = useService('bpmnFactory');
    const commandStack = useService('commandStack');
    const translate = useService('translate');

    const businessObject = getBusinessObject(element);

    let extensions = parameter.get('extensions');

    const extensionsList = (extensions && extensions.get('extensions')) || [];

    function addExtension() {
        const commands = [];
        // (1) ensure extensions
        if (!extensions) {
            extensions = createElement(
                'magic:Extensions',
                {},
                businessObject,
                bpmnFactory
            );

            commands.push({
                cmd: 'element.updateModdleProperties',
                context: {
                    element,
                    moddleElement: parameter,
                    properties: { extensions }
                }
            });
        }
        // (2) add extension
        if (extensions.extensions == undefined || extensions?.extensions?.length == 0) {
            let addExtensions = []
            for (var i = 0; i < fields.length; i++) {
                const type = fields[i].split(":")[1];
                const extension = createElement(
                    'magic:Extension',
                    { key: fields[i], type: type },
                    extensions,
                    bpmnFactory
                );
                addExtensions.push(extension);
            }
            commands.push({
                cmd: 'element.updateModdleProperties',
                context: {
                    element,
                    moddleElement: extensions,
                    properties: {
                        extensions: addExtensions
                    }
                }
            });
        }
        commandStack.execute('properties-panel.multi-command-executor', commands);
    }

    function removeExtension(extension) {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: extensions,
            properties: {
                extensions: without(extensions.get('extensions'), extension)
            }
        });
    }

    return <ListEntry
        element={element}
        autoFocusEntry={`[data-entry-id="${id}-extension-${extensionsList.length - 1}"] input`}
        id={id}
        label={translate('Values')}
        items={extensionsList}
        component={Extension}
        onAdd={addExtension}
        onRemove={removeExtension} />;
}

function Extension(props) {
    const {
        element,
        id: idPrefix,
        index,
        item: extension,
        open
    } = props;
    const type = extension.type;
    const translate = useService('translate');
    const id = `${idPrefix}-value-${index}`;
    return (
        <CollapsibleEntry
            id={id}
            element={element}
            entries={ValueExtensionProps({
                extension,
                element,
                idPrefix: id,
                type
            })}
            label={extension.get('key') || translate('<empty>')}
            open={open}
        />
    );
}