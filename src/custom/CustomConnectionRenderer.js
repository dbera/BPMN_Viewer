import { assign } from 'min-dash';
import {
    is
  } from 'bpmn-js/lib/util/ModelUtil';
import {
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  append as svgAppend
} from 'tiny-svg';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { getSemantic, getStrokeColor, getFillColor, getLabelColor, black } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer';
import TextRenderer from 'bpmn-js/lib/draw/TextRenderer';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
const TASK_BORDER_RADIUS = 2;
export default class CustomConnectionRenderer extends BpmnRenderer {
    constructor(config, eventBus, styles, pathMap,
        canvas, textRenderer, bpmnRenderer) {
        super(config, eventBus, styles, pathMap, canvas, textRenderer, 1600);
        this.bpmnRenderer = bpmnRenderer;
        this.textRenderer = textRenderer;
        this.defaultFillColor = config && config.defaultFillColor;
        this.defaultStrokeColor = config && config.defaultStrokeColor;
        this.computeStyle = styles.computeStyle;
    }

    canRender(element) {
        // only render data association 
        return isAny(element, [ 'bpmn:DataOutputAssociation', 'bpmn:DataInputAssociation' ]);
    };

    drawConnection(parentNode, element) {
        const connection = this.bpmnRenderer.drawConnection(parentNode, element);
        //const line = this.renderer('bpmn:DataOutputAssociation')(parentNode, element);
        //console.log(line);
        if (is(element, 'bpmn:DataOutputAssociation') || is(element, 'bpmn:DataInputAssociation')) {
          var semantic = getSemantic(element);
          var bo = getBusinessObject(element);
          bo.name = semantic.name;
          var labelText = semantic.guard;
          var label = this.renderExternalLabel(connection, element, labelText);
          var waypoints = connection.waypoints;
        // var fill = getFillColor(element, this.defaultFillColor);
        // var stroke = getStrokeColor(element, this.defaultStrokeColor);
        //var attrs = { markerEnd: this.$super.(this, 'association-end', fill, stroke) };
        var pathData = this.createPathFromConnection(element);
        var path = this.drawPath(parentNode, pathData, connection.attr);
        var label = this.renderLabel(path, labelText, {
            box: element,
            align: 'center-middle',
            padding: 5,
            style: {
              fill: getLabelColor(element, this.defaultLabelColor, this.defaultStrokeColor)
            }});
        var text = this.textRenderer.createText(labelText || '', { size :{width:100}});

        svgClasses(text).add('djs-label');

        

        
        const rect = drawRect(parentNode, 30, 20, TASK_BORDER_RADIUS, '#cc0000');
        svgAppend(rect, text);
        //this.renderExternalLabel(rect, element, labelText);
    svgAttr(rect, {
      transform: 'translate(100, 100)'
    });
    svgAttr(text, {
        transform: 'translate(100, 100)'
      });
          //svgAppend(path, label);
          console.log(path);
          return connection;
        }
        //return connection;
    };

    renderExternalLabel(parentGfx, element, labelText) {
        var box = {
          width: 90,
          height: 30,
          x: parentGfx.x + element.width/2,
          y: parentGfx.y + element.height/2
        };
    
        return this.renderLabel(parentGfx, labelText, {
          box: box,
          fitBox: true,
          style: assign(
            {},
            this.textRenderer.getExternalStyle(),
            {
              fill: getLabelColor(element, this.defaultLabelColor, this.defaultStrokeColor)
            }
          )
        });
    }

    renderLabel(parentGfx, label, options) {

        options = assign({
          size: {
            width: 100
          }
        }, options);
    
        var text = this.textRenderer.createText(label || '', options);
    
        svgClasses(text).add('djs-label');
    
        svgAppend(parentGfx, text);
    
        return text;
    }

    createPathFromConnection(connection) {
        var waypoints = connection.waypoints;
    
        var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
        for (var i = 1; i < waypoints.length; i++) {
          pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
        }
        return pathData;
    }

    drawPath(parentGfx, d, attrs) {

        attrs = this.computeStyle(attrs, [ 'no-fill' ], {
          strokeWidth: 2,
          stroke: black,
          strokeDasharray: '0.5, 5'
        });
    
        var path = svgCreate('path');
        svgAttr(path, { d: d });
        svgAttr(path, attrs);
    
        svgAppend(parentGfx, path);
    
        return path;
    }
}

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

CustomConnectionRenderer.$inject = [
    'config',
    'eventBus',
    'styles',
    'pathMap',
    'canvas',
    'textRenderer',
    'bpmnRenderer'
  ];