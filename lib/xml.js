// A simple XML building class.
export class Xml {
  rootNode = {
    _children: [],
    _parent: null,
    _level: 0,
  }

  constructor() {
    this.node = this.rootNode
  }

  openNode(tag) {
    const childNode = {
      _tag: tag,
      _attrs: {},
      _content: null,
      _comment: [],
      _parent: this.node,
      _children: [],
      _level: this.node._level + 1,
    }
    this.node._children.push(childNode)

    this.node = childNode
    return this
  }

  setAttribute(attr, val) {
    this.node._attrs[attr] = val
    return this
  }

  setContent(content) {
    if (this.node._content !== null) {
      throw new Error(`Content already set on <${this.node._tag} /> element.`)
    }

    this.node._content = content
    return this
  }

  addComment(comment) {
    this.node._comment.push(comment)
    return this
  }

  closeNode() {
    if (!this.node._parent) {
      throw new Error(`Cannot close root node.`)
    }

    this.node = this.node._parent
    return this
  }

  getString() {
    // The XML declaration '<?xml version="1.0" encoding="utf-8"?>' is optional.
    // Without it, it defaults to XML 1.0.
    const xml = '<?xml version="1.0" encoding="utf-8"?>'
    const string = this._stringify(this.rootNode._children[0])

    return `${xml}${string}`
  }

  _stringify({ _tag, _attrs, _content, _comment, _children, _level }) {
    let string = ''

    const identation = `\n${'  '.repeat(_level - 1)}`

    // Comments are appended before the node they belong to.
    const comments = _comment
      .map((comment) => `${identation}<!-- ${comment} -->`)
      .join('')
    string += comments

    const attrs = Object.entries(_attrs)
      .map(([attr, val]) => ` ${attr}="${val}"`)
      .join('')

    if (_children.length || _content) {
      string += `${identation}<${_tag}${attrs}>`
      _children.forEach((child) => {
        string += this._stringify(child)
      })

      if (_content) {
        string += `${_content}</${_tag}>`
      } else {
        string += `${identation}</${_tag}>`
      }
    } else {
      string += `${identation}<${_tag}${attrs}/>`
    }

    return string
  }
}
