/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea: () => width * height,
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const val = Object.values(JSON.parse(json));
  return new proto.constructor(...val);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class ElementSelector {
  constructor() {
    this.selector = {
      element: null,
      id: null,
      class: [],
      attr: [],
      pseudoClass: [],
      pseudoElement: null,
      combineStr: undefined,
    };

    this.err = {
      duplicate: 'Element, id and pseudo-element should not occur more then one time inside the selector',
      order: 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
    };
  }

  element(value) {
    if (this.selector.id
      || this.selector.class.length
      || this.selector.attr.length
      || this.selector.pseudoClass.length
      || this.selector.pseudoElement) {
      throw new Error(this.err.order);
    }

    if (this.selector.element) throw new Error(this.err.duplicate);

    this.selector.element = value;
    return this;
  }

  id(value) {
    if (this.selector.class.length
      || this.selector.attr.length
      || this.selector.pseudoClass.length
      || this.selector.pseudoElement) {
      throw new Error(this.err.order);
    }
    if (this.selector.id) throw new Error(this.err.duplicate);
    this.selector.id = value;
    return this;
  }

  class(value) {
    if (this.selector.attr.length
      || this.selector.pseudoClass.length
      || this.selector.pseudoElement) {
      throw new Error(this.err.order);
    }
    this.selector.class.push(value);
    return this;
  }

  attr(value) {
    if (this.selector.pseudoClass.length || this.selector.pseudoElement) {
      throw new Error(this.err.order);
    }
    this.selector.attr.push(value);
    return this;
  }

  pseudoClass(value) {
    if (this.selector.pseudoElement) throw new Error(this.err.order);
    this.selector.pseudoClass.push(value);
    return this;
  }

  pseudoElement(value) {
    if (this.selector.pseudoElement) {
      throw new Error(this.err.duplicate);
    }
    this.selector.pseudoElement = value;
    return this;
  }

  combine(selector1, combinator, selector2) {
    this.selector.combineStr = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  }

  get(type) {
    const builderData = this.selector;
    switch (type) {
      case 'element':
        return builderData.element ? builderData.element : '';
      case 'id':
        return builderData.id ? `#${builderData.id}` : '';
      case 'class':
        return builderData.class.length ? `.${builderData.class.join('.')}` : '';
      case 'attr':
        return builderData.attr.length ? `[${builderData.attr.join('')}]` : '';
      case 'pseudoClass':
        return builderData.pseudoClass.length ? `:${builderData.pseudoClass.join(':')}` : '';
      case 'pseudoElement':
        return builderData.pseudoElement ? `::${builderData.pseudoElement}` : '';
      default: break;
    }

    return '';
  }

  stringifySelector(items, before, after) {
    this.items = items || [];
    if (!Array.isArray(this.items) && this.items != null) {
      this.items = [this.items];
    }
    return this.items.reduce((prev, curr) => prev + before + curr + after, '');
  }

  stringify() {
    if (this.selector.combineStr) return this.selector.combineStr;

    return this.get('element')
        + this.get('id')
        + this.get('class')
        + this.get('attr')
        + this.get('pseudoClass')
        + this.get('pseudoElement');
  }
}

const cssSelectorBuilder = {

  element(value) {
    return new ElementSelector().element(value);
  },

  id(value) {
    return new ElementSelector().id(value);
  },

  class(value) {
    return new ElementSelector().class(value);
  },

  attr(value) {
    return new ElementSelector().attr(value);
  },

  pseudoClass(value) {
    return new ElementSelector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new ElementSelector().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new ElementSelector().combine(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
