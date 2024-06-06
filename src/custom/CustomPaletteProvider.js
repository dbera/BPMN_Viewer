import PaletteProvider from "bpmn-js/lib/features/palette/PaletteProvider";

export default class CustomPaletteProvider extends PaletteProvider {
    constructor(
      palette, 
      create, 
      elementFactory,
      spaceTool, 
      lassoTool, 
      handTool,
      globalConnect, 
      translate
    ) {
    super(
      palette,
      create,
      elementFactory,
      spaceTool,
      lassoTool,
      handTool,
      globalConnect,
      translate
    );

    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
  }

  getPaletteEntries(element) {
    const { create, elementFactory, translate } = this;

    function createSubprocess(event) {
      var subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        x: 0,
        y: 0,
        isExpanded: false
      });
    
      var startEvent = elementFactory.createShape({
        type: 'bpmn:StartEvent',
        x: 40,
        y: 82,
        parent: subProcess
      });
    
      create.start(event, [ subProcess, startEvent ], {
        hints: {
          autoSelect: [ subProcess ]
        }
      });
    }
    
    var paletteEntries = super.getPaletteEntries(element);
    // Remove unused palette items
    delete paletteEntries["create.subprocess-expanded"];
    delete paletteEntries["create.group"];

    // TODO: Add custom palette items
    paletteEntries['create.subprocess-collapsed'] = {
      group: 'activity',
      className: 'bpmn-icon-subprocess-collapsed',
      title: translate('Create collapsed SubProcess'),
      action: {
        dragstart: createSubprocess,
        click: createSubprocess
      }
    };

    //console.log(paletteEntries);
    return paletteEntries;
  }
}

CustomPaletteProvider.$inject = [
  "palette",
  "create",
  "elementFactory",
  "spaceTool",
  "lassoTool",
  "handTool",
  "globalConnect",
  "translate"
];
