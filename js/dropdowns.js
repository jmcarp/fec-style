'use strict';

/* global require, module, document */

var $ = require('jquery');
var perfectScrollbar = require('perfect-scrollbar/jquery')($);

var KEYCODE_ESC = 27;

/**
 * Dropdown toggles
 * @constructor
 * @param {string} selector - CSS selector for the fieldset that contains everything
 */
function Dropdown(selector) {
  var self = this;

  self.isOpen = false;

  self.$body = $(selector);
  self.$selected = this.$body.find('.dropdown__selected');
  self.$button = this.$body.find('.dropdown__button');
  self.$panel = this.$body.find('.dropdown__panel');

  self.$button.on('click', this.toggle.bind(this));
  self.$panel.on('change', 'input[type="checkbox"]', this.handleCheck.bind(this));
  $(document.body).on('click focusin', this.handleClickAndFocus.bind(this));
  $(document.body).on('keyup', this.handleKeyup.bind(this));

  // Set ARIA attributes
  self.$button.attr('aria-haspopup', 'true');
  self.$panel.attr('aria-label','More options');
}

Dropdown.prototype.toggle = function(e) {
  e.preventDefault();
  var method = this.isOpen ? this.hide : this.show;
  method.apply(this);
};

Dropdown.prototype.show = function() {
  this.$panel.attr('aria-hidden', 'false');
  this.$panel.perfectScrollbar({suppressScrollX: true});
  this.$panel.find('input[type="checkbox"]:first').focus();
  this.isOpen = true;
};

Dropdown.prototype.hide = function() {
  this.$panel.attr('aria-hidden', 'true');
  this.isOpen = false;
};

Dropdown.prototype.handleClickAndFocus = function(e) {
  var $target = $(e.target);
  if (!this.$body.has($target).length ||
      this.$selected.has($target).length) {
    this.hide();
  }
};

Dropdown.prototype.handleKeyup = function(e) {
  if (e.keyCode == KEYCODE_ESC) {
    if (this.isOpen) {
      this.hide();
    }
  }
};

Dropdown.prototype.handleCheck = function(e) {
  var $input = $(e.target);
  if ($input.is(':checked')) {
    this.selectItem($input);
  }
};

Dropdown.prototype.selectItem = function($input) {
  var $item = $input.parent('.dropdown__item');
  var $prev = $item.prev('.dropdown__item');
  var $next = $item.next('.dropdown__item');
  this.$selected.append($item);
  if ($next.length) {
    $next.find('input[type="checkbox"]').focus();
  } else if ($prev.length) {
    $prev.find('input[type="checkbox"]').focus();
  } else {
    this.removePanel();
  }
};

Dropdown.prototype.removePanel = function() {
  this.$selected.find('input[type="checkbox"]').focus();
  this.$panel.remove();
  this.$button.remove();
};

module.exports = {Dropdown: Dropdown};