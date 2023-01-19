import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {
  assign
} from 'min-dash';
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  getRoundRectPath
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { getSemantic, getStrokeColor, getLabelColor } from 'bpmn-js/lib/draw/BpmnRenderUtil';

const HIGH_PRIORITY = 1500,
      TASK_BORDER_RADIUS = 2;


export default class CustomRenderer_old extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;
    //this.textRenderer = textRenderer;
  }

  canRender(element) {

    // only render data association (ignore labels)
    return isAny(element, [ 'bpmn:Task', 'bpmn:Event' ]);
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    if (is(element, 'bpmn:Task')) {
      const rect = drawRect(parentNode, 100, 80, TASK_BORDER_RADIUS, '#52B415');

      prependTo(rect, parentNode);

      svgRemove(shape);

      return shape;
    }

    const rect = drawRect(parentNode, 30, 20, TASK_BORDER_RADIUS, '#cc0000');

    svgAttr(rect, {
      transform: 'translate(-20, -10)'
    });

    return shape;
  }

  drawConnection(parentNode, element) {
    const connection = this.bpmnRenderer.drawConnection(parentNode, element);
    if (is(element, 'bpmn:DataOutputAssociation')) {
      var semantic = getSemantic(element);
      var labelText = semantic.guard;
      const label = renderLabel(parentNode, "labelText", {
        align: 'center-top',
        fitBox: true,
        style: {
          fill: getStrokeColor(element, this.bpmnRenderer.defaultLabelColor, this.bpmnRenderer.defaultStrokeColor)
        }
      });
      var translateX = midPoint.x - labelBounds.width / 2,
            translateY = midPoint.y + messageBounds.height / 2 + ELEMENT_LABEL_DISTANCE;

      transform(label, translateX, translateY, 0);
      return connection;
    }
  }

  getShapePath(shape) {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }
}

CustomRenderer.$inject = [ 'eventBus', 'bpmnRenderer' ];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, strokeColor) {
  const rect = svgCreate('rect');

  svgAttr(rect, {
    width: width,
    height: height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: strokeColor || '#000',
    strokeWidth: 2,
    fill: '#fff'
  });

  svgAppend(parentNode, rect);

  return rect;
}

// copied from https://github.com/bpmn-io/diagram-js/blob/master/lib/core/GraphicsFactory.js
function prependTo(newNode, parentNode, siblingNode) {
  parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild);
}

function renderLabel(parentGfx, label, options) {

  options = assign({
    size: {
      width: 100
    }
  }, options);

  var text = textRenderer.createText(label || '', options);

  svgClasses(text).add('djs-label');

  svgAppend(parentGfx, text);

  return text;
}