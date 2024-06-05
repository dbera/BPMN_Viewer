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
      var paletteEntries = super.getPaletteEntries(element);
      // Remove unused palette items
      delete paletteEntries["create.subprocess-expanded"];
      delete paletteEntries["create.participant-expanded"];
      delete paletteEntries["create.group"];
      // TODO: Add custom palette items

      console.log(paletteEntries);
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
  