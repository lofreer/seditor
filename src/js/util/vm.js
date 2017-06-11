class Vm {
    constructor(tagName, props = {}, children = []) {
        if (!(this.tagName = tagName)) return
        this.props = props
        this.children = children
    }

    render() {
        let self = this
        let node = document.createElement(this.tagName),
            props = this.props,
            children = this.children

        for( var key in props) {
            if (/^on[A-Za-z]/.test(key)) {
                var eventType = key.toLowerCase().replace('on', '')
                node.addEventListener(eventType, props[key], false)
            } else {
                node.setAttribute(key, props[key])
            }
        }
        children.forEach(function(child) {
            if (Array.isArray(child)) {
                child.forEach(function(item){
                    item && (item instanceof HTMLElement ? node.appendChild(item) : node.insertAdjacentHTML('beforeend', item))
                })
            } else {
                child && (child instanceof HTMLElement ? node.appendChild(child) : node.insertAdjacentHTML('beforeend', child))
            }
        })
        return node
    }
}

export default (tagName, props, children) => {
    return new Vm(tagName, props, children).render()
}