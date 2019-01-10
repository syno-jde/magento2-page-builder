/*eslint-disable */
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

define(["Magento_Ui/js/modal/alert", "Magento_PageBuilder/js/content-type-collection", "Magento_PageBuilder/js/drag-drop/sortable"], function (_alert, _contentTypeCollection, _sortable) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */

  /**
   * @api
   */
  var RootContainer =
  /*#__PURE__*/
  function (_contentTypeCollectio) {
    "use strict";

    _inheritsLoose(RootContainer, _contentTypeCollectio);

    function RootContainer() {
      return _contentTypeCollectio.apply(this, arguments) || this;
    }

    var _proto = RootContainer.prototype;

    /**
     * Return the sortable options
     *
     * @returns {JQueryUI.SortableOptions}
     */
    _proto.getSortableOptions = function getSortableOptions() {
      return (0, _sortable.getSortableOptions)(this.preview);
    };
    /**
     * Remove a child from the observable array
     *
     * @param child
     */


    _proto.removeChild = function removeChild(child) {
      if (this.getChildren().length === 1) {
        (0, _alert)({
          content: $t("You are not able to remove the final row from the content."),
          title: $t("Unable to Remove")
        });
        return;
      }

      _contentTypeCollectio.prototype.removeChild.call(this, child);
    };
    /**
     * Determine if the container can receive drop events?
     *
     * @returns {boolean}
     */


    _proto.isContainer = function isContainer() {
      return true;
    };

    return RootContainer;
  }(_contentTypeCollection);

  return RootContainer;
});
//# sourceMappingURL=content-type-collection.js.map
