import { getBusinessObject, isAny } from 'bpmn-js/lib/util/ModelUtil';
import {
    getLabel
} from 'bpmn-js/lib/features/label-editing/LabelUtil';
export default function CustomLabel(eventBus, modeling) {
    eventBus.on('element.changed', function (event) {
        var ele = event.element;
        if (ele.type === 'label') {
            if (isAny(ele, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:DataObjectReference'])) {
                if (getBusinessObject(ele).objectType !== undefined) {
                    let newLabel = "";
                    if (getBusinessObject(ele).name?.includes(":")) {
                        newLabel = getBusinessObject(ele).name.split(":")[0] + ":" + getBusinessObject(ele).objectType?.split(":")[0];
                    } else {
                        newLabel = getBusinessObject(ele).name + ":" + getBusinessObject(ele).objectType?.split(":")[0];
                    }
                    if (newLabel !== getLabel(ele)) {
                        modeling.updateProperties(ele, {
                            name: newLabel
                        });
                    }
                }
            }
        }
    });
}