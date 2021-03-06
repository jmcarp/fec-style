'use strict';

/* global require, module, document */

var $ = require('jquery');
var _ = require('underscore');
var List = require('list.js');

var terms = require('./terms');

var KEYCODE_ESC = 27;

var ITEM_TEMPLATE =
  '<li id="glossary-list-item" class="glossary__item">' +
    '<div class="js-accordion_header accordion__header">' +
      '<h4 class="glossary-term"></h4>' +
      '<button class="button button--secondary accordion__button js-accordion_button"></button>' +
    '</div>' +
    '<p class="glossary-definition js-accordion_item"></p>' +
  '</li>';

/**
 * Glossary widget
 * @constructor
 * @param {string} bodySelector - CSS selector for glossary body
 * @param {string} toggleSelector - CSS selector for glossary toggle
 * @param {string} termSelector - CSS selector for glossary terms in document
 */
function Glossary(bodySelector, toggleSelector, termSelector) {
  var self = this;

  self.$body = $(bodySelector);
  self.$toggle = $(toggleSelector);
  self.$search = this.$body.find('.glossary__search');

  // Initialize state
  self.isOpen = false;

  // Update DOM
  self.populate();
  self.linkTerms();

  // Bind listeners
  self.$toggle.on('click', this.toggle.bind(this));
  self.$body.on('click', '.toggle', this.toggle.bind(this));
  self.$search.on('input', this.handleInput.bind(this));
  $(document.body).on('keyup', this.handleKeyup.bind(this));
}

/** Populate internal list.js list of terms */
Glossary.prototype.populate = function() {
  var options = {
    item: ITEM_TEMPLATE,
    valueNames: ['glossary-term'],
    listClass: 'glossary__list',
    searchClass: 'glossary__search'
  };
  this.list = new List('glossary', options, terms);
  this.list.sort('glossary-term', {order: 'asc'});
};

/** Add links to terms in body */
Glossary.prototype.linkTerms = function() {
  var self = this;
  var $terms = $(self.termSelector || '.term');
  $terms.each(function(){
    var $term = $(this);
    $term.attr('title', 'Click to define')
      .attr('tabindex', 0)
      .data('term', $term.data('term').toLowerCase());
  });
  $terms.on('click keypress', function(e) {
    if (e.which === 13 || e.type === 'click') {
      self.show();
      self.findTerm($(this).data('term'));
    }
  });
};

/** Highlight a term */
Glossary.prototype.findTerm = function(term) {
  this.$search.val(term);

  // Highlight the term and remove other highlights
  this.$body.find('.term--highlight').removeClass('term--highlight');
  this.$body.find('span[data-term="' + term + '"]').addClass('term--highlight');
  this.list.filter(function(item) {
    return item._values['glossary-term'].toLowerCase() === term;
  });

  // Hack: Expand text for selected item
  this.list.search();
  _.each(this.list.visibleItems, function(item) {
    var $elm = $(item.elm).find('div');
    if ($elm.hasClass('accordion--collapsed')) {
      $elm.find('.accordion__button').click();
    }
  });
};

Glossary.prototype.toggle = function() {
  var method = this.isOpen ? this.hide : this.show;
  method.apply(this);
};

Glossary.prototype.show = function() {
  this.$body.addClass('is-open').attr('aria-hidden', 'false');
  this.$toggle.addClass('active');
  this.$search.focus();
  this.isOpen = true;
};

Glossary.prototype.hide = function() {
  this.$body.removeClass('is-open').attr('aria-hidden', 'true');
  this.$toggle.removeClass('active');
  this.$toggle.focus();
  this.isOpen = false;
};

/** Remove existing filters on input */
Glossary.prototype.handleInput = function(e) {
  if (this.list.filtered) {
    this.list.filter();
  }
};

/** Close glossary on escape keypress */
Glossary.prototype.handleKeyup = function(e) {
  if (e.keyCode == KEYCODE_ESC) {
    if (this.isOpen) {
      this.hide();
    }
  }
};

module.exports = {Glossary: Glossary};
