import { is, getBusinessObject, isAny } from 'bpmn-js/lib/util/ModelUtil';
const inputEventPosition = { x: 200, y: 300 };
const outputEventPosition = { x: 800, y: 300 };
const inputDataPosition = { x: 200, y: 400 };
const outputDataPosition = { x: 800, y: 400 };
export default function CustomDrilldown(eventBus, canvas, elementFactory, elementRegistry, modeling) {

    //handle deletion or update name of event/data reference will delete/update elements in all levels
    eventBus.on('element.changed', function (event) {
        var ele = event.element;
        if (isAny(ele, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent'])) {
            if (ele.type === 'label') {
                if (typeof ele.businessObject.linkedInfEventId !== 'undefined' &&
                    ele.businessObject.linkedInfEventId !== '') {
                    var linkedEvent = elementRegistry.get(ele.businessObject.linkedInfEventId);
                    if (linkedEvent !== undefined) {
                        if (linkedEvent?.businessObject.name !== ele.businessObject.name) {
                            modeling.updateProperties(linkedEvent, {
                                name: ele.businessObject.name
                            });
                        }
                        if (ele.businessObject.linkedInfEventId !== "") {
                            modeling.updateProperties(ele, {
                                linkedInfEventId: ''
                            });
                        }
                    }

                }
            } else {
                linkedEvent = elementRegistry.get(ele.businessObject.linkedInfEventId);
                if (ele.businessObject.name == null && linkedEvent !== undefined) {
                    modeling.removeElements([linkedEvent]);
                }
            }
        }

        if (isAny(ele, ['bpmn:DataStoreReference', 'bpmn:DataObjectReference'])) {
            if (ele.type === 'label') {
                if (typeof ele.businessObject.linkedInfDataId !== "undefined" &&
                    ele.businessObject.linkedInfDataId !== '') {
                    var linkedData = elementRegistry.get(ele.businessObject.linkedInfDataId);
                    if (linkedData !== undefined) {
                        if (linkedData.businessObject.name !== ele.businessObject.name) {
                            modeling.updateProperties(linkedData, {
                                name: ele.businessObject.name
                            });
                        }
                        if (ele.businessObject.linkedInfDataId !== "") {
                            modeling.updateProperties(ele, {
                                linkedInfDataId: ''
                            });
                        }
                    }
                }
            } else {
                linkedData = elementRegistry.get(ele.businessObject.linkedInfDataId);
                if (ele.businessObject.name == null && linkedData !== undefined) {
                    modeling.removeElements([linkedData]);
                }
            }
        }
    }
    );

    //add linked event or data reference to subprocess
    eventBus.on('root.set', function (event) {
        var bo = getBusinessObject(event.element);
        var root = canvas.findRoot(event.element.id);
        if (is(bo, 'bpmn:SubProcess')) {
            var rootId = root.businessObject.id;
            drawInputDataRef(bo, rootId, event);
            drawOutputDataRef(bo, rootId, event);
            drawInputEvent(bo, rootId, event);
            drawOutputEvent(bo, rootId, event);
        }
    }
    );
    function drawOutputEvent(bo, rootId, event) {
        bo.outgoing?.forEach(function (edge) {
            var target = edge.targetRef;
            var elements = elementRegistry.filter(function (element) {
                var parents = element.businessObject.$parent;
                if (parents !== null && parents?.id === rootId) {
                    return element.businessObject.name === edge.targetRef.name &&
                        isAny(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent']);
                }
            });
            if (elements.length === 0) {
                if (is(target, 'bpmn:IntermediateCatchEvent')) {
                    if (is(target.eventDefinitions[0], 'bpmn:MessageEventDefinition')) {
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if (is(target.eventDefinitions[0], 'bpmn:TimerEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:TimerEventDefinition'
                        });
                    }
                    if (is(target.eventDefinitions[0], 'bpmn:SignalEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = target.name;
                    newEvent.businessObject.linkedSupEventId = target.id;
                    target.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, outputEventPosition, event.element);
                }
                if (is(target, 'bpmn:IntermediateThrowEvent')) {
                    if (is(target.eventDefinitions[0], 'bpmn:EscalationEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:EscalationEventDefinition'
                        });
                    }
                    if (is(target.eventDefinitions[0], 'bpmn:MessageEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if (is(target.eventDefinitions[0], 'bpmn:SignalEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = target.name;
                    newEvent.businessObject.linkedSupEventId = target.id;
                    target.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, outputEventPosition, event.element);
                }
            }
        });
    }
    function drawInputEvent(bo, rootId, event) {
        bo.incoming?.forEach(function (edge) {
            var source = edge.sourceRef;
            var elements = elementRegistry.filter(function (element) {
                var parents = element.businessObject.$parent;
                if (parents !== null && parents?.id === rootId) {
                    return element.businessObject.name === edge.sourceRef.name &&
                        isAny(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent']);
                }
            });
            if (elements.length === 0) {
                if (is(source, 'bpmn:IntermediateCatchEvent')) {
                    if (is(source.eventDefinitions[0], 'bpmn:MessageEventDefinition')) {
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if (is(source.eventDefinitions[0], 'bpmn:TimerEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:TimerEventDefinition'
                        });
                    }
                    if (is(source.eventDefinitions[0], 'bpmn:SignalEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = source.name;
                    newEvent.businessObject.linkedSupEventId = source.id;
                    source.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, inputEventPosition, event.element);
                }
                if (is(source, 'bpmn:IntermediateThrowEvent')) {
                    if (is(source.eventDefinitions[0], 'bpmn:EscalationEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:EscalationEventDefinition'
                        });
                    }
                    if (is(source.eventDefinitions[0], 'bpmn:MessageEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if (is(source.eventDefinitions[0], 'bpmn:SignalEventDefinition')) {
                        newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = source.name;
                    newEvent.businessObject.linkedSupEventId = source.id;
                    source.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, inputEventPosition, event.element);
                }
            }
        });
    }
    function drawOutputDataRef(bo, rootId, event) {
        bo.dataOutputAssociations?.forEach(function (dataOutput) {
            var target = dataOutput.targetRef;
            var elements = elementRegistry.filter(function (element) {
                var parents = element.businessObject.$parent;
                if (parents !== null && parents?.id === rootId) {
                    return element.businessObject.name === target.name && isAny(element, ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']);
                }
            });
            if (elements.length === 0) {
                if (is(target, 'bpmn:DataStoreReference')) {
                    var dataRef = elementFactory.createShape({
                        //id: target.id,
                        type: 'bpmn:DataStoreReference'
                    });
                    dataRef.businessObject.name = target.name;
                    dataRef.businessObject.linkedSupDataId = target.id;
                    target.linkedInfDataId = dataRef.id;
                    modeling.createShape(dataRef, outputDataPosition, event.element);
                }
                if (is(target, 'bpmn:DataObjectReference')) {
                    var dataObjRef = elementFactory.createShape({
                        //id: target.id,
                        type: 'bpmn:DataObjectReference'
                    });
                    dataObjRef.businessObject.name = target.name;
                    dataObjRef.businessObject.linkedSupDataId = target.id;
                    target.linkedInfDataId = dataObjRef.id;
                    modeling.createShape(dataObjRef, outputDataPosition, event.element);
                }
            }
        });
    }

    function drawInputDataRef(bo, rootId, event) {
        bo.dataInputAssociations?.forEach(function (dataInput) {
            var source = dataInput.sourceRef[0];
            var elements = elementRegistry.filter(function (element) {
                var parents = element.businessObject.$parent;
                if (parents !== null && parents?.id === rootId) {
                    return element.businessObject.name === source.name && isAny(element, ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']);
                }
            });
            if (elements.length === 0) {
                if (is(source, 'bpmn:DataStoreReference')) {
                    var dataRef = elementFactory.createShape({
                        type: 'bpmn:DataStoreReference'
                    });
                    dataRef.businessObject.name = source.name;
                    dataRef.businessObject.linkedSupDataId = source.id;
                    source.linkedInfDataId = dataRef.id;
                    modeling.createShape(dataRef, inputDataPosition, event.element);
                }
                if (is(source, 'bpmn:DataObjectReference')) {
                    var dataObjRef = elementFactory.createShape({
                        type: 'bpmn:DataObjectReference'
                    });
                    dataObjRef.businessObject.name = source.name;
                    dataObjRef.businessObject.linkedSupDataId = source.id;
                    source.linkedInfDataId = dataObjRef.id;
                    modeling.createShape(dataObjRef, inputDataPosition, event.element);
                }
            }
        });
    }

    function isRootParent(element) {
        var root = canvas.getRootElement();
        var parents = element.businessObject.$parent;
        if (root.id === parents.id) {
            return true;
        }
        return false;
    }
}

CustomDrilldown.$inject = ['eventBus', 'canvas', 'elementFactory', 'elementRegistry', 'modeling'];