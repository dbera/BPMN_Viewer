import inherits from 'inherits';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer';
import Ids from 'ids';
import {
  append as svgAppend,
  classes as svgClasses,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';
import { assign } from 'min-dash';
import { getSemantic, getStrokeColor, getFillColor, getLabelColor, black } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { query as domQuery } from 'min-dom';
import {
  transform
} from 'diagram-js/lib/util/SvgTransformUtil';
var RENDERER_IDS = new Ids();

export default function CustomConnRenderer(config, eventBus, styles, pathMap, canvas, textRenderer, bpmnRenderer) {
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

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, ['no-fill'], {
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
    'bpmn:SequenceFlow': (parentGfx, element) => {
      var semantic = getSemantic(element);
      const path = this.bpmnRenderer.drawConnection(parentGfx, element);

      var midPoint = path.getPointAtLength(path.getTotalLength() / 2);
      var labelText = semantic.expression;
      var label = renderLabel(parentGfx, labelText, {
        box: element,
        align: "center-top",
        fitBox: true,
        style: {
          fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor)
        }
      });

      var labelBounds = label.getBBox();

      var translateX = midPoint.x - labelBounds.width / 2,
        translateY = midPoint.y //- labelBounds.height / 2 - ELEMENT_LABEL_DISTANCE;
      transform(label, translateX, translateY, 0);
      return path;
    },
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
      var pathData = createPathFromConnection(element);
      var path = drawPath(parentGfx, pathData, attrs);
      var midPoint = path.getPointAtLength(path.getTotalLength() / 2);

      var labelText = semantic.expression;
      var label = renderLabel(parentGfx, labelText, {
        align: 'center-top',
        fitBox: true,
        style: {
          fill: getStrokeColor(element, defaultLabelColor, defaultStrokeColor)
        }
      });
      var labelBounds = label.getBBox();

      var translateX = midPoint.x - labelBounds.width / 2,
        translateY = midPoint.y;

      transform(label, translateX, translateY, 0);
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
inherits(CustomConnRenderer, BaseRenderer);
CustomConnRenderer.$inject = ['config', 'eventBus', 'styles', 'pathMap', 'canvas', 'textRenderer', 'bpmnRenderer'];
CustomConnRenderer.prototype.marker = BpmnRenderer.prototype.marker;
CustomConnRenderer.prototype.canRender = function (element) {
  return isAny(element, ['bpmn:DataOutputAssociation', 'bpmn:DataInputAssociation', 'bpmn:SequenceFlow']);
};
CustomConnRenderer.prototype.drawConnection = function (p, element) {
  var type = element.type;
  var h = this.renderers[type];
  if (element.color == null)
    element.color = "#000"

  /* jshint -W040 */
  return h(p, element);
};