import { is, getBusinessObject, isAny } from 'bpmn-js/lib/util/ModelUtil';
export default function CustomDrilldown(eventBus, canvas, elementFactory, elementRegistry, modeling){
    
    //update name of event and data will update elements in all levels
    eventBus.on('element.changed', function(event) {
        var ele = event.element;
        if (isAny(ele, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent'])){
            if (ele.type === 'label') {
                if (typeof ele.businessObject.linkedInfEventId !== 'undefined' &&
                ele.businessObject.linkedInfEventId !== ''){
                    var linkedEvent = elementRegistry.get(ele.businessObject.linkedInfEventId);
                    if (linkedEvent.businessObject.name !== ele.businessObject.name){
                        modeling.updateProperties(linkedEvent, {
                            name: ele.businessObject.name
                        });
                    }
                }
                if (typeof ele.businessObject.linkedSupEventId !== 'undefined' &&
                ele.businessObject.linkedSupEventId !== ''){
                    var linkedEvent = elementRegistry.get(ele.businessObject.linkedSupEventId);
                    if (linkedEvent.businessObject.name !== ele.businessObject.name){
                        modeling.updateProperties(linkedEvent, {
                            name: ele.businessObject.name
                        });
                    }
                }
            }
        }

        if (isAny(ele, ['bpmn:DataStoreReference', 'bpmn:DataObjectReference'])){
            if (ele.type === 'label') {
                if (typeof ele.businessObject.linkedInfDataId !== 'undefined' &&
                ele.businessObject.linkedInfDataId !== ''){
                    var linkedData = elementRegistry.get(ele.businessObject.linkedInfDataId);
                    if (linkedData.businessObject.name !== ele.businessObject.name){
                        modeling.updateProperties(linkedData, {
                            name: ele.businessObject.name
                        });
                    }
                }
                if (typeof ele.businessObject.linkedSupDataId !== 'undefined' &&
                ele.businessObject.linkedSupDataId !== ''){
                    var linkedData = elementRegistry.get(ele.businessObject.linkedSupDataId);
                    if (linkedData.businessObject.name !== ele.businessObject.name){
                        modeling.updateProperties(linkedData, {
                            name: ele.businessObject.name
                        });
                    }
                }
            }
        }
      }
    );

    //add linked event or data reference to subprocess
    eventBus.on('root.set', function(event) {
        var bo = getBusinessObject(event.element);
        var root =  canvas.findRoot(event.element.id);
        if (is(bo, 'bpmn:SubProcess')){
            var rootId = root.businessObject.id;
            drawInputDataRef(bo, rootId, event);
            drawOutputDataRef(bo, rootId, event);
            drawInputEvent(bo, rootId, event);
            drawOutputEvent(bo, rootId, event);
          }
        }
    );
    function drawOutputEvent(bo, rootId, event){
        bo.outgoing?.forEach(function(edge){
            var target = edge.targetRef;
            var elements = elementRegistry.filter(function(element) {
                var parents = element.businessObject.$parent;
                if(parents !== null && parents?.id === rootId){
                  return element.businessObject.name === edge.targetRef.name && 
                  isAny(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent']);
                }
            });
            if (elements.length === 0){
                if (is(target, 'bpmn:IntermediateCatchEvent')){
                    if(is(target.eventDefinitions[0], 'bpmn:MessageEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if(is(target.eventDefinitions[0], 'bpmn:TimerEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:TimerEventDefinition'
                        });
                    }
                    if(is(target.eventDefinitions[0], 'bpmn:SignalEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = target.name;
                    newEvent.businessObject.linkedSupEventId = target.id;
                    target.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, { x: 800, y: 300 }, event.element);
                }
                if(is(target, 'bpmn:IntermediateThrowEvent')){
                    if(is(target.eventDefinitions[0], 'bpmn:EscalationEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:EscalationEventDefinition'
                        });
                    }
                    if(is(target.eventDefinitions[0], 'bpmn:MessageEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if(is(target.eventDefinitions[0], 'bpmn:SignalEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = target.name;
                    newEvent.businessObject.linkedSupEventId = target.id;
                    target.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, { x: 800, y: 300 }, event.element);
                }
            }
        });
    }
    function drawInputEvent(bo, rootId, event){
        bo.incoming?.forEach(function(edge){
            var source = edge.sourceRef;
            var elements = elementRegistry.filter(function(element) {
              var parents = element.businessObject.$parent;
              if(parents !== null && parents?.id === rootId){
                return element.businessObject.name === edge.sourceRef.name && 
                isAny(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent']);
              }
            });
            if (elements.length === 0){
                if (is(source, 'bpmn:IntermediateCatchEvent')){
                    if(is(source.eventDefinitions[0], 'bpmn:MessageEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if(is(source.eventDefinitions[0], 'bpmn:TimerEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:TimerEventDefinition'
                        });
                    }
                    if(is(source.eventDefinitions[0], 'bpmn:SignalEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateCatchEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = source.name;
                    newEvent.businessObject.linkedSupEventId = source.id;
                    source.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, { x: 200, y: 300 }, event.element);
                }
                if(is(source, 'bpmn:IntermediateThrowEvent')){
                    if(is(source.eventDefinitions[0], 'bpmn:EscalationEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:EscalationEventDefinition'
                        });
                    }
                    if(is(source.eventDefinitions[0], 'bpmn:MessageEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:MessageEventDefinition'
                        });
                    }
                    if(is(source.eventDefinitions[0], 'bpmn:SignalEventDefinition')){
                        var newEvent = elementFactory.createShape({
                            type: 'bpmn:IntermediateThrowEvent',
                            eventDefinitionType: 'bpmn:SignalEventDefinition'
                        });
                    }
                    newEvent.businessObject.name = source.name;
                    newEvent.businessObject.linkedSupEventId = source.id;
                    source.linkedInfEventId = newEvent.id;
                    modeling.createShape(newEvent, { x: 200, y: 300 }, event.element);
                }
            }
        });
    }
    function drawOutputDataRef(bo, rootId, event){
        bo.dataOutputAssociations?.forEach(function(dataOutput){
            var target = dataOutput.targetRef;
            var elements = elementRegistry.filter(function(element) {
              var parents = element.businessObject.$parent;
              if(parents !== null && parents?.id === rootId){
                return element.businessObject.name === target.name && isAny(element, ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']);
              }
            });
            if (elements.length === 0){
              if (is(target, 'bpmn:DataStoreReference')){
                var dataRef = elementFactory.createShape({
                  //id: target.id,
                  type: 'bpmn:DataStoreReference' 
                });
                dataRef.businessObject.name = target.name;
                dataRef.businessObject.linkedSupDataId = target.id;
                target.linkedInfDataId = dataRef.id;
                modeling.createShape(dataRef, { x: 800, y: 400 }, event.element);
              }
              if (is(target, 'bpmn:DataObjectReference')){
                var dataObjRef = elementFactory.createShape({
                  //id: target.id,
                  type: 'bpmn:DataObjectReference' 
                });
                dataObjRef.businessObject.name = target.name;
                dataObjRef.businessObject.linkedSupDataId = target.id;
                target.linkedInfDataId = dataObjRef.id;
                modeling.createShape(dataObjRef, { x: 800, y: 400 }, event.element);
              }
            }
        });
    }

    function drawInputDataRef(bo, rootId, event){
        bo.dataInputAssociations?.forEach(function(dataInput){
            var source = dataInput.sourceRef[0];
            var elements = elementRegistry.filter(function(element) {
              var parents = element.businessObject.$parent;
              if(parents !== null && parents?.id === rootId){
                return element.businessObject.name === source.name && isAny(element, ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']);
              }
            });
            if (elements.length === 0){
              if (is(source, 'bpmn:DataStoreReference')){
                var dataRef = elementFactory.createShape({
                  type: 'bpmn:DataStoreReference' 
                });
                dataRef.businessObject.name = source.name;
                dataRef.businessObject.linkedSupDataId = source.id;
                source.linkedInfDataId = dataRef.id;
                modeling.createShape(dataRef, { x: 200, y: 400 }, event.element);
              }
              if (is(source, 'bpmn:DataObjectReference')){
                var dataObjRef = elementFactory.createShape({
                  type: 'bpmn:DataObjectReference' 
                });
                dataObjRef.businessObject.name = source.name;
                dataObjRef.businessObject.linkedSupDataId = source.id;
                source.linkedInfDataId = dataObjRef.id;
                modeling.createShape(dataObjRef, { x: 200, y: 400 }, event.element);
              }
            }
        });
    }

    function isRootParent(element){
        var root =  canvas.getRootElement();
        var parents = element.businessObject.$parent;
        if (root.id === parents.id){
            return true;
        }
        return false;
    }
}

CustomDrilldown.$inject = [ 'eventBus', 'canvas', 'elementFactory', 'elementRegistry', 'modeling' ];