import { is } from 'bpmn-js/lib/util/ModelUtil';

export default class CustomContextPad {
  constructor(config, contextPad, create, elementFactory, injector, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    if (config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      autoPlace,
      create,
      elementFactory,
      translate
    } = this;

    function appendSubprocess(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({ type: 'bpmn:SubProcess' });
        autoPlace.append(element, shape);
      } else {
        appendSubprocessStart(event, element);
      }
    }

    function appendSubprocessStart(event) {
      const shape = elementFactory.createShape({ type: 'bpmn:SubProcess' });
      create.start(event, shape, element);
    }

    var entries = [];

    if (element.businessObject.$instanceOf('bpmn:Event') || is(element, 'bpmn:SubProcess')) {
      entries['append.subprocess-collapsed'] = {
        group: 'model',
        className: 'bpmn-icon-subprocess-collapsed',
        title: translate('Append collapsed SubProcess'),
        action: {
          click: appendSubprocess,
          dragstart: appendSubprocessStart
        }
      };
    }

    return entries;
  }
}

CustomContextPad.$inject = [
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
];