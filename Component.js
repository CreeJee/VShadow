

// TODO : event 및 Async 그외 re-render 파이프라인 규격지원

/********************
*  custom elements  *
*********************/
const VShadow = (()=>{
    const tagNameSymbol = Symbol("@@tagName");
    const extendsSymbol = Symbol("@@extendsTagName");
    const assignClone = Symbol("@@assignSymbol");
    const ROOT_HTML = document.children[0];
    let Store = null;
    let _Store = null;
    let onLoad = ()=>{};
    (async ()=>{
        Store = (await import("./Component/core/store.js")).default;
        // RootStore
        //non - safe but side effect
        onLoad.apply(VShadow,[ROOT_HTML.$store = Store.root]);
    })()
    /**
     * @param  {HTMLElement} anyHtmlClass [description]
     * @return {Class extends BaseComponent} [description]
     */
    const BaseComponent = (anyHtmlClass) => {
        const _getParent = (_parent)=>_parent.$store instanceof Store ? _parent : _parent === ROOT_HTML ? ROOT_HTML : _getParent((_parent instanceof DocumentFragment ? _parent.host : _parent.parentNode)) ;
        const classObj = class BaseComponent extends anyHtmlClass{
            // private clone util
            [assignClone](oldNode,newNode,deep){
                newNode.$store = new Store();
                let generatedNode = new (newNode.constructor.bind(newNode))();
                if(deep){
                    (async ()=>{
                        Array.from(newNode.children).forEach(n=>generatedNode.appendChild(n));
                        await generatedNode.VShadow(newNode.root,newNode.$store);
                    })()
                }
                generatedNode.parent = oldNode.parent;
                generatedNode.isReady = oldNode.isReady;
                return generatedNode;
            }
            // native observe
            cloneNode(deep){
                return this[assignClone](this,super.cloneNode(deep),deep);
            }
            
            connectedCallback(){
                (async ()=>{
                    try{
                        this.root = this.attachShadow({mode: 'open'});
                        this.root.innerHTML = await classObj.template;
                        this.isShadow = true;
                    }
                    catch(e){
                        /*
                            TODO : 
                                root와 host는 document-fragment로 최적화를 손보자
                                document fragment 가 안될경우 모든셀렉터를 프록시와 querySelector를 이용해서 시뮬레이션 
                                모든 내부 디펜전시는 querySelector로 통일
                        */
                        let temp = document.createElement("template");
                        temp.innerHTML = await classObj.template;
                        this.root = temp.content;
                        this.root.host = this;
                        this.isShadow = false;
                        this.appendChild(this.root);
                    }
                    this.parent = _getParent(this.parentNode);
                    this.parent.$store.addChild(this,this.$store);
                    this.VShadow(
                        this.root,
                        this.$store
                    );
                    super.isReady = true;
                    if(super.connectedCallback instanceof Function){
                        super.connectedCallback();
                    }
                })();
            }
            attributeChangedCallback(key,oldVal,newVal){
                if(this.isReady && super.attributeChangedCallback instanceof Function){
                    super.attributeChangedCallback(key,oldVal,newVal);
                }
            }
            disconnectedCallback(){
                if(super.disconnectedCallback instanceof Function){
                    super.disconnectedCallback();
                }
                if(this.parent instanceof HTMLElement){
                    let $child = this.parent.$store.children;
                    let index = $child.indexOf(this.$store);
                    if(index >= 0){
                        $child.splice(index,1)
                    }
                }
            }
        };
        Object.defineProperty(classObj,"name",{
            enumerable: false,
            configurable: true,
            writable: false,
            value : `Component<${anyHtmlClass.name}>`
        });
        return classObj;
    }
    
    return new (
        class VShadow{
            get tagNameSymbol(){
                return tagNameSymbol;
            }
            get extendsSymbol(){
                return extendsSymbol;
            }
            get $store(){
                return Store.root;
            }
            ready(functor){
                if(functor instanceof Function){
                    onLoad = functor;
                }
            }
            constructor(){
                this.define = FixedType.expect(this.define,HTMLElement);
                this.load = FixedType.expect(this.load,FixedType.Spread(String));
                this.definedTag = {};
                this.extendsTag = {};
                return Object.freeze(this);
            }
            isDefined(classObj){
                return !!window.customElements.get(classObj[tagNameSymbol]);
            }
            /**
             *bind elementClass to customElements
             *
             * @param {HTMLElement} ElementClass
             * @returns ElementRegistry
             */
            async define(OriginalClass){
                const ElementClass = BaseComponent(OriginalClass);
                const registerdTagName = ElementClass[tagNameSymbol];
                const extendsTagName = ElementClass[extendsSymbol];
                const customElements = window.customElements;
                // window.customElements.whenDefined(registerdTagName).then(ElementClass.onFactory);
                if(typeof registerdTagName === "string"  && registerdTagName.includes("-")){
                    if (extendsTagName !== undefined) {
                        this.extendsTag[extendsTagName] = ElementClass;
                    }
                    customElements.define(registerdTagName,ElementClass,extendsTagName ? {extends : extendsTagName} : undefined);
                    return this.definedTag[registerdTagName] = ElementClass;
                }
                else{
                    throw new Error(`need well-formated tagName [${this.name}.${tagNameSymbol.toString()}]`);
                }
            }
            /**
             * @return {Promise<ElementRegistry.Component[]>}
             * @param {String[]} src
             */
            async load(...src){
                return await Promise.all(
                    src.map((path)=>import(path))
                ).then(
                    (scriptSources)=>scriptSources.flatMap((object,index)=>{
                        try{
                            return this.define(object.default);
                        }
                        catch(e){
                            throw new Error(`it needs extends HTMLElement [soruce : ${src[index]}]`);
                        };
                    })
                )
            }
            /**
             * mapping document.createElement
             * @param  {String} elementName 
             * @param  {Object} options     
             * @return {extends HTMLElement}             
             * @beta
             *
             * it will be ignored key "is" for "options"
             */
            createElement(elementName,options = {}){
                let extendsTag = this.extendsTag[elementName];
                if(extendsTag instanceof HTMLElement){
                    elementName = extendsTag[extendsSymbol];
                    if (options.is !== undefined) {
                        console.warn("it will ignored options [key : \"is\"]");
                    }
                    Object.assign(options,{is : extendsTag[extendsTagName]})
                }
                return document.createElement(elements,options)
                // TODO : extendsTagName이 선언된 태그 한정으로 option재생성
            }
        }
    );
})();