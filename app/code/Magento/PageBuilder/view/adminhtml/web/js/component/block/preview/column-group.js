/*eslint-disable */
define(["jquery", "knockout", "underscore", "../../config", "../../stage/panel/group/block", "./block", "./column-group/dragdrop", "./column-group/registry", "./column-group/resizing"], function (_jquery, _knockout, _underscore, _config, _block, _block2, _dragdrop, _registry, _resizing) {
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var ColumnGroup =
  /*#__PURE__*/
  function (_PreviewBlock) {
    _inheritsLoose(ColumnGroup, _PreviewBlock);

    /**
     * PreviewBlock constructor
     *
     * @param {Block} parent
     * @param {Object} config
     */
    function ColumnGroup(parent, config) {
      var _this;

      _this = _PreviewBlock.call(this, parent, config) || this;
      _this.parent = void 0;
      _this.resizing = _knockout.observable(false);
      _this.dropPlaceholder = void 0;
      _this.movePlaceholder = void 0;
      _this.groupElement = void 0;
      _this.resizeGhost = void 0;
      _this.resizeColumnInstance = void 0;
      _this.resizeColumnWidths = [];
      _this.resizeMaxGhostWidth = void 0;
      _this.resizeMouseDown = void 0;
      _this.resizeLeftLastColumnShrunk = void 0;
      _this.resizeRightLastColumnShrunk = void 0;
      _this.resizeLastPosition = void 0;
      _this.resizeHistory = {
        left: [],
        right: []
      };
      _this.dropOverElement = void 0;
      _this.dropPositions = [];
      _this.dropPosition = void 0;
      _this.movePosition = void 0;
      _this.debounceBindDraggable = _underscore.debounce(function () {
        return _this.bindDraggable();
      }, 150);
      _this.parent = parent;
      return _this;
    }
    /**
     * Init the droppable & resizing interactions
     *
     * @param group
     */


    var _proto = ColumnGroup.prototype;

    _proto.bindInteractions = function bindInteractions(group) {
      var _this2 = this;

      this.groupElement = (0, _jquery)(group);
      this.initDroppable(this.groupElement);
      this.initMouseMove(this.groupElement); // We have to re-bind the draggable library to any new children that appear inside the group

      this.parent.children.subscribe(this.debounceBindDraggable.bind(this));
      this.debounceBindDraggable(); // Listen for resizing events from child columns

      this.parent.children.subscribe(function (newColumns) {
        newColumns.forEach(function (column) {
          column.on("initResizing", function (event, params) {
            _this2.registerResizeHandle(column, params.handle);
          });
        });
      }); // Handle the mouse leaving the window

      (0, _jquery)("body").mouseleave(this.endAllInteractions.bind(this));
    };
    /**
     * Init the drop placeholder
     *
     * @param element
     */


    _proto.bindDropPlaceholder = function bindDropPlaceholder(element) {
      this.dropPlaceholder = (0, _jquery)(element);
    };
    /**
     * Init the move placeholder
     *
     * @param {Element} element
     */


    _proto.bindMovePlaceholder = function bindMovePlaceholder(element) {
      this.movePlaceholder = (0, _jquery)(element);
    };
    /**
     * Retrieve the ghost element from the template
     *
     * @param {Element} ghost
     */


    _proto.bindGhost = function bindGhost(ghost) {
      this.resizeGhost = (0, _jquery)(ghost);
    };
    /**
     * Register a resize handle within a child column
     *
     * @param {Column} column
     * @param {JQuery<HTMLElement>} handle
     */


    _proto.registerResizeHandle = function registerResizeHandle(column, handle) {
      var _this3 = this;

      handle.off("mousedown");
      handle.on("mousedown", function (event) {
        event.preventDefault();

        _this3.resizing(true);

        _this3.resizeColumnInstance = column;
        _this3.resizeColumnWidths = (0, _resizing.determineColumnWidths)(_this3.resizeColumnInstance, _this3.groupElement);
        _this3.resizeMaxGhostWidth = (0, _resizing.determineMaxGhostWidth)(_this3.resizeColumnWidths); // Set a flag of the columns which are currently being resized

        _this3.setColumnsAsResizing(column, (0, _resizing.getAdjacentColumn)(column, "+1")); // Force the cursor to resizing


        (0, _jquery)("body").css("cursor", "col-resize"); // Reset the resize history

        _this3.resizeHistory = {
          left: [],
          right: []
        };
        _this3.resizeLastPosition = null;
        _this3.resizeMouseDown = true;
      });
    };
    /**
     * Set columns in the group as resizing
     *
     * @param {Column} columns
     */


    _proto.setColumnsAsResizing = function setColumnsAsResizing() {
      for (var _len = arguments.length, columns = new Array(_len), _key = 0; _key < _len; _key++) {
        columns[_key] = arguments[_key];
      }

      columns.forEach(function (column) {
        column.resizing(true);
      });
    };
    /**
     * Unset resizing flag on all child columns
     */


    _proto.unsetResizingColumns = function unsetResizingColumns() {
      this.parent.children().forEach(function (column) {
        column.resizing(false);
      });
    };
    /**
     * Bind draggable instances to the child columns
     */


    _proto.bindDraggable = function bindDraggable() {
      var _this4 = this;

      this.parent.children().forEach(function (column) {
        column.element.draggable({
          appendTo: "body",
          containment: "body",
          handle: ".move-column",
          revertDuration: 250,
          helper: function helper() {
            var helper = (0, _jquery)(this).clone();
            helper.css({
              opacity: 0.5,
              pointerEvents: "none",
              width: (0, _jquery)(this).width() + "px",
              zIndex: 100
            });
            return helper;
          },
          start: function start(event) {
            // Use the global state as columns can be dragged between groups
            (0, _registry.setDragColumn)(_knockout.dataFor((0, _jquery)(event.target)[0]));
            _this4.dropPositions = (0, _dragdrop.calculateDropPositions)(_this4.parent);
          },
          stop: function stop() {
            var draggedColumn = (0, _registry.getDragColumn)();

            if (_this4.movePosition && draggedColumn) {
              // Check if we're moving within the same group, even though this function will
              // only ever run on the group that bound the draggable event
              if (draggedColumn.parent === _this4.parent) {
                _this4.parent.handleColumnSort(draggedColumn, _this4.movePosition.insertIndex);

                _this4.movePosition = null;
              }
            }

            (0, _registry.removeDragColumn)();

            _this4.dropPlaceholder.removeClass("left right");

            _this4.movePlaceholder.removeClass("active");
          }
        });
      });
    };
    /**
     * End all current interactions
     */


    _proto.endAllInteractions = function endAllInteractions() {
      this.resizing(false);
      this.resizeMouseDown = null;
      this.resizeLeftLastColumnShrunk = this.resizeRightLastColumnShrunk = null;
      this.dropPositions = [];
      this.unsetResizingColumns(); // Change the cursor back

      (0, _jquery)("body").css("cursor", "");
      this.dropPlaceholder.removeClass("left right");
      this.movePlaceholder.removeClass("active");
      this.resizeGhost.removeClass("active");
    };
    /**
     * Init the resizing events on the group
     *
     * @param {JQuery<HTMLElement>} group
     */


    _proto.initMouseMove = function initMouseMove(group) {
      var _this5 = this;

      group.mousemove(function (event) {
        _this5.handleResizingMouseMove(event, group);

        _this5.handleDraggingMouseMove(event, group);

        _this5.handleDroppingMouseMove(event, group);
      }).mouseleave(function () {
        _this5.movePlaceholder.css("left", "").removeClass("active");
      }).mouseup(function () {
        _this5.endAllInteractions();
      });
    };
    /**
     * Record the resizing history for this action
     *
     * @param {string} usedHistory
     * @param {string} direction
     * @param {Column} adjustedColumn
     * @param {string} modifyColumnInPair
     */


    _proto.recordResizeHistory = function recordResizeHistory(usedHistory, direction, adjustedColumn, modifyColumnInPair) {
      if (usedHistory) {
        this.resizeHistory[usedHistory].pop();
      }

      this.resizeHistory[direction].push({
        adjustedColumn: adjustedColumn,
        modifyColumnInPair: modifyColumnInPair
      });
    };
    /**
     * Handle the resizing on mouse move, we always resize a pair of columns at once
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     */


    _proto.handleResizingMouseMove = function handleResizingMouseMove(event, group) {
      var _this6 = this;

      var currentCol;

      if (this.resizeMouseDown) {
        event.preventDefault();
        var currentPos = event.pageX;
        var resizeColumnLeft = this.resizeColumnInstance.element.offset().left;
        var resizeColumnWidth = this.resizeColumnInstance.element.outerWidth();
        var resizeHandlePosition = resizeColumnLeft + resizeColumnWidth;
        var direction = currentPos >= resizeHandlePosition ? "right" : "left";
        var adjustedColumn;
        var modifyColumnInPair; // We need to know if we're modifying the left or right column in the pair

        var usedHistory; // Was the adjusted column pulled from history?
        // Determine which column in the group should be adjusted for this action

        var _determineAdjustedCol = (0, _resizing.determineAdjustedColumn)(group, currentPos, this.resizeColumnInstance, this.resizeHistory);

        adjustedColumn = _determineAdjustedCol[0];
        modifyColumnInPair = _determineAdjustedCol[1];
        usedHistory = _determineAdjustedCol[2];
        // Calculate the ghost width based on mouse position and bounds of allowed sizes
        var ghostWidth = (0, _resizing.calculateGhostWidth)(group, currentPos, this.resizeColumnInstance, modifyColumnInPair, this.resizeMaxGhostWidth);
        this.resizeGhost.width(ghostWidth - 15 + "px").addClass("active");

        if (adjustedColumn && this.resizeColumnWidths) {
          currentCol = this.resizeColumnWidths.find(function (val) {
            return currentPos > val.position - 35 && currentPos < val.position + 35 && val.forColumn === modifyColumnInPair;
          });

          if (currentCol) {
            var mainColumn = this.resizeColumnInstance; // If we're using the left data set, we're actually resizing the right column of the group

            if (modifyColumnInPair === "right") {
              mainColumn = (0, _resizing.getAdjacentColumn)(this.resizeColumnInstance, "+1");
            } // Ensure we aren't resizing multiple times, also validate the last resize isn't the same as the
            // one being performed now. This occurs as we re-calculate the column positions on resize


            if ((0, _resizing.getColumnWidth)(mainColumn) !== currentCol.width && this.resizeLastPosition !== currentCol.position) {
              this.recordResizeHistory(usedHistory, direction, adjustedColumn, modifyColumnInPair);
              this.resizeLastPosition = currentCol.position;
              this.parent.handleColumnResize(mainColumn, currentCol.width, adjustedColumn); // Wait for the render cycle to finish from the above resize before re-calculating

              _underscore.defer(function () {
                // If we do a resize, re-calculate the column widths
                _this6.resizeColumnWidths = (0, _resizing.determineColumnWidths)(_this6.resizeColumnInstance, _this6.groupElement);
                _this6.resizeMaxGhostWidth = (0, _resizing.determineMaxGhostWidth)(_this6.resizeColumnWidths);
              });
            }
          }
        }
      }
    };
    /**
     * Handle a column being dragged around the group
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     */


    _proto.handleDraggingMouseMove = function handleDraggingMouseMove(event, group) {
      var dragColumn = (0, _registry.getDragColumn)();

      if (dragColumn) {
        // If the drop positions haven't been calculated for this group do so now
        if (this.dropPositions.length === 0) {
          this.dropPositions = (0, _dragdrop.calculateDropPositions)(this.parent);
        }

        var columnInstance = dragColumn;
        var currentX = event.pageX - (0, _jquery)(group).offset().left; // Are we within the same column group or have we ended up over another?

        if (columnInstance.parent === this.parent) {
          var currentColumn = dragColumn.element;
          var currentColumnRight = currentColumn.position().left + currentColumn.width();
          var lastColInGroup = this.parent.children()[this.parent.children().length - 1].element;
          var insertLastPos = lastColInGroup.position().left + lastColInGroup.width() / 2;
          this.movePosition = this.dropPositions.find(function (position) {
            // Only ever look for the left placement, except the last item where we look on the right
            var placement = currentX >= insertLastPos ? "right" : "left"; // There is 200px area over each column borders

            return currentX > position[placement] - 100 && currentX < position[placement] + 100 && // Verify we're not dropping next to the current columns right position
            !(currentX > currentColumnRight - 100 && currentX < currentColumnRight + 100) && position.affectedColumn !== columnInstance && // Check affected column isn't the current column
            position.placement === placement // Verify the position, we only check left on sorting
            ;
          });

          if (this.movePosition) {
            this.dropPlaceholder.removeClass("left right");
            this.movePlaceholder.css({
              left: this.movePosition.placement === "left" ? this.movePosition.left : "",
              right: this.movePosition.placement === "right" ? (0, _jquery)(group).outerWidth() - this.movePosition.right - 5 : ""
            }).addClass("active");
          } else {
            this.movePlaceholder.removeClass("active");
          }
        } else {
          // If we're moving to another column group we utilise the existing drop placeholder
          this.movePosition = this.dropPositions.find(function (position) {
            return currentX > position.left && currentX < position.right && position.canShrink;
          });

          if (this.movePosition) {
            var classToRemove = this.movePosition.placement === "left" ? "right" : "left";
            this.movePlaceholder.removeClass("active");
            this.dropPlaceholder.removeClass(classToRemove).css({
              left: this.movePosition.placement === "left" ? this.movePosition.left : "",
              right: this.movePosition.placement === "right" ? (0, _jquery)(group).width() - this.movePosition.right : "",
              width: (0, _jquery)(group).width() / (0, _resizing.getMaxColumns)() + "px"
            }).addClass(this.movePosition.placement);
          } else {
            this.dropPlaceholder.removeClass("left right");
          }
        }
      }
    };
    /**
     * Handle mouse move events on when dropping elements
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     */


    _proto.handleDroppingMouseMove = function handleDroppingMouseMove(event, group) {
      if (this.dropOverElement) {
        var currentX = event.pageX - (0, _jquery)(group).offset().left;
        this.dropPosition = this.dropPositions.find(function (position) {
          return currentX > position.left && currentX < position.right && position.canShrink;
        });

        if (this.dropPosition) {
          this.dropPlaceholder.removeClass("left right").css({
            left: this.dropPosition.placement === "left" ? this.dropPosition.left : "",
            right: this.dropPosition.placement === "right" ? (0, _jquery)(group).width() - this.dropPosition.right : "",
            width: (0, _jquery)(group).width() / (0, _resizing.getMaxColumns)() + "px"
          }).addClass(this.dropPosition.placement);
        }
      }
    };
    /**
     * Init the droppable functionality for new columns
     *
     * @param {JQuery<HTMLElement>} group
     */


    _proto.initDroppable = function initDroppable(group) {
      var _this7 = this;

      var currentDraggedBlock;
      group.droppable({
        activate: function activate(event) {
          currentDraggedBlock = _knockout.dataFor(event.currentTarget);
        },
        deactivate: function deactivate() {
          _this7.dropOverElement = null;

          _this7.dropPlaceholder.removeClass("left right"); // Delay the removal of the flag so other systems have time to execute

        },
        drop: function drop(event, ui) {
          if (_this7.dropOverElement && _this7.dropPosition) {
            _this7.parent.handleNewColumnDrop(event, ui, _this7.dropPosition);

            _this7.dropOverElement = null;
          }

          var column = (0, _registry.getDragColumn)();

          if (_this7.movePosition && column && column.parent !== _this7.parent) {
            _this7.parent.handleExistingColumnDrop(event, _this7.movePosition);
          }

          _this7.dropPositions = [];

          _this7.dropPlaceholder.removeClass("left right");
        },
        greedy: true,
        out: function out() {
          _this7.dropOverElement = null;

          _this7.dropPlaceholder.removeClass("left right");
        },
        over: function over() {
          // Always calculate drop positions when an element is dragged over
          _this7.dropPositions = (0, _dragdrop.calculateDropPositions)(_this7.parent); // Is the element currently being dragged a column?

          if (currentDraggedBlock instanceof _block.Block && currentDraggedBlock.getConfig() === _config.getContentTypeConfig("column")) {
            _this7.dropOverElement = true;
          }
        }
      });
    };

    return ColumnGroup;
  }(_block2);

  return ColumnGroup;
});
//# sourceMappingURL=column-group.js.map
