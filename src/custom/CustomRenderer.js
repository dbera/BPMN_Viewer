import inherits from 'inherits';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer';
import {
  createLine
} from 'diagram-js/lib/util/RenderUtil';
import Ids from 'ids';
import {
  append as svgAppend,
  classes as svgClasses,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';
import { assign } from 'min-dash';
import {
  getRoundRectPath
} from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { getSemantic, getStrokeColor, getFillColor, getLabelColor, black, getDi } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import {query as domQuery} from 'min-dom';
import {
  rotate,
  transform,
  translate
} from 'diagram-js/lib/util/SvgTransformUtil';
const HIGH_PRIORITY = 1500,
      TASK_BORDER_RADIUS = 2;
var RENDERER_IDS = new Ids();
var ELEMENT_LABEL_DISTANCE = 10;

export default function CustomRenderer(config, eventBus, styles, pathMap, canvas, textRenderer, bpmnRenderer) {
  BaseRenderer.call(this, eventBus, 2000);

  var computeStyle = styles.computeStyle;
  var defaultFillColor = config && config.defaultFillColor,
  defaultStrokeColor = config && config.defaultStrokeColor,
  defaultLabelColor = config && config.defaultLabelColor;
  var rendererId = RENDERER_IDS.next();
  this.bpmnRenderer = bpmnRenderer;
  var markers = {};
  function marker(type, fill, stroke) {
    var id = type + '-' + fill + '-' + stroke + '-' + rendererId;

    if (!markers[id]) {
      createMarker(type, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  function createMarker(type, fill, stroke) {
    var id = type + '-' + fill + '-' + stroke + '-' + rendererId;
    if (type === 'association-start') {
      var associationStart = svgCreate('path');
      svgAttr(associationStart, { d: 'M 11 5 L 1 10 L 11 15' });

      addMarker(id, {
        element: associationStart,
        attrs: {
          fill: 'none',
          stroke: stroke,
          strokeWidth: 1.5
        },
        ref: { x: 1, y: 10 },
        scale: 0.5
      });
    }
    if (type === 'association-end') {
      var associationEnd = svgCreate('path');
      svgAttr(associationEnd, { d: 'M 1 5 L 11 10 L 1 15' });

      addMarker(id, {
        element: associationEnd,
        attrs: {
          fill: 'none',
          stroke: stroke,
          strokeWidth: 1.5
        },
        ref: { x: 12, y: 10 },
        scale: 0.5
      });
    }
  }

  function addMarker(id, options) {
    var attrs = assign({
      fill: 'black',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeDasharray: 'none'
    }, options.attrs);

    var ref = options.ref || { x: 0, y: 0 };

    var scale = options.scale || 1;

    // fix for safari / chrome / firefox bug not correctly
    // resetting stroke dash array
    if (attrs.strokeDasharray === 'none') {
      attrs.strokeDasharray = [10000, 1];
    }

    var marker = svgCreate('marker');

    svgAttr(options.element, attrs);

    svgAppend(marker, options.element);

    svgAttr(marker, {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

    var defs = domQuery('defs', canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');

      svgAppend(canvas._svg, defs);
    }

    svgAppend(defs, marker);

    markers[id] = marker;
  }

  function drawLine(parentGfx, waypoints, attrs) {
    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'none'
    });

    var line = createLine(waypoints, attrs);

    svgAppend(parentGfx, line);

    return line;
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

  function renderEmbeddedLabel(parentGfx, element, align) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.text, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: element.color
      }
    });
  }

  function renderExternalLabel(parentGfx, element, labelText) {
    var box = {
      width: 90,
      height: 10,
      x: element.width + element.target.x,
      y: element.height + element.target.y
    };
    console.log(element.width + element.target.x);
    console.log(element.height + element.target.y);
    console.log(element.waypoints);
    return renderLabel(parentGfx, labelText, {
      box: box,
      fitBox: true,
      style: assign(
          {},
          textRenderer.getExternalStyle(),
          {
            fill: element.color
          }
      )
    });
  }

  function renderCustomLabel(parentGfx, line, text, element) {
    var textBox = renderLabel(parentGfx, text, {
      box: {
        height: 30,
        width: element.width
      },
      align: 'bottom-middle',
      style: {
        fill: getStrokeColor(element, 'black')
      }
    });
    var messageBounds = line.getBBox(),
            labelBounds = textBox.getBBox();
    var midPoint = line.getPointAtLength(line.getTotalLength() / 2);
    var translateX = midPoint.x - labelBounds.width / 2,
    translateY = midPoint.y + messageBounds.height / 2 + ELEMENT_LABEL_DISTANCE;
    console.log(translateX);
    console.log(translateY);
    transform(textBox, translateX, translateY, 0);
  }

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: black
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  var renderers = this.renderers = {
    'bpmn:Association': (parentGfx, element, attrs) => {

      var semantic = getSemantic(element);

      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      attrs = assign({
        strokeDasharray: '0.5, 5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs || {});

      if (semantic.associationDirection === 'One' ||
          semantic.associationDirection === 'Both') {
        attrs.markerEnd = marker('association-end', fill, stroke);
      }

      if (semantic.associationDirection === 'Both') {
        attrs.markerStart = marker('association-start', fill, stroke);
      }
      var semantic = getSemantic(element),
          di = getDi(element);
      var pathData = createPathFromConnection(element);
      var path = drawPath(parentGfx, pathData, attrs);
      var midPoint = path.getPointAtLength(path.getTotalLength() / 2);
      var markerPathData = pathMap.getScaledPath('MESSAGE_FLOW_MARKER', {
        abspos: {
          x: midPoint.x,
          y: midPoint.y
        }
      });

      var messageAttrs = { strokeWidth: 1 };

      if (di.messageVisibleKind === 'initiating') {
        messageAttrs.fill = 'white';
        messageAttrs.stroke = black;
      } else {
        messageAttrs.fill = '#888';
        messageAttrs.stroke = 'white';
      }

      //var message = drawPath(parentGfx, markerPathData, messageAttrs);
      var labelText = semantic.expression;
      var label = renderLabel(parentGfx, labelText, {
        align: 'center-top',
        fitBox: true,
        style: {
          fill: getStrokeColor(element, defaultLabelColor, defaultStrokeColor)
        }
      });
      var //messageBounds = message.getBBox(),
          labelBounds = label.getBBox();

      var translateX = midPoint.x - labelBounds.width / 2,
          translateY = midPoint.y //+ messageBounds.height / 2 +  ELEMENT_LABEL_DISTANCE;

      transform(label, translateX, translateY, 0);
      
      //var text = getSemantic(element).name;
      //element.setLabel(labelText);
      //renderEmbeddedLabel(parentGfx,element,{align: 'bottom-middle'});
      //renderCustomLabel(parentGfx,line, labelText,element); // ExtraAdd
      //renderExternalLabel(parentGfx, element, labelText);
      return path;
    },
    'bpmn:DataInputAssociation': (parentGfx, element) => {
      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, '#000');
      return renderers['bpmn:Association'](parentGfx, element, {
        markerEnd: marker('association-end', fill, stroke)
      })
    },
    'bpmn:DataOutputAssociation': (parentGfx, element) => {
      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, '#000');
      return renderers['bpmn:Association'](parentGfx, element, {
        markerEnd: marker('association-end', fill, stroke)
      })
    }
  }
}
inherits(CustomRenderer, BaseRenderer);
CustomRenderer.$inject = [ 'config', 'eventBus', 'styles', 'pathMap', 'canvas', 'textRenderer', 'bpmnRenderer' ];
CustomRenderer.prototype.marker = BpmnRenderer.prototype.marker;
CustomRenderer.prototype.canRender = function(element) {
  return isAny(element, [ 'bpmn:DataOutputAssociation', 'bpmn:DataInputAssociation' ]);
};
CustomRenderer.prototype.drawConnection = function(p, element) {
  var type = element.type;
  var h = this.renderers[type];
  if(element.color == null)
    element.color= "#000"

  /* jshint -W040 */
  return h(p, element);
};
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