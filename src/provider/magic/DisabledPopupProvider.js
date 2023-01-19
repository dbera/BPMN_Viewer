export default function DisabledPopupProvider(popupMenu, bpmnReplace, translate) {
    popupMenu.registerProvider('bpmn-replace', this);

    this._bpmnReplace = bpmnReplace;
    this._translate = translate;
}

DisabledPopupProvider.$inject = [
    'popupMenu',
    'bpmnReplace',
    'translate'
];

DisabledPopupProvider.prototype.getPopupMenuEntries = function(element) {
    var bpmnReplace = this._bpmnReplace,
        translate = this._translate;
    return function(entries) {
        delete entries['replace-with-link-intermediate-catch'];
        delete entries['replace-with-link-intermediate-throw'];
        delete entries['replace-with-compensation-intermediate-throw'];
        delete entries['replace-with-conditional-intermediate-catch'];
        return entries;
    };
};
