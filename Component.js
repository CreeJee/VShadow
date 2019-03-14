// TODO : event 및 Async 그외 re-render 파이프라인 규격지원

/********************
*  custom elements  *
*********************/
const VShadow = (()=>{
    const tagNameSymbol = Symbol("@@tagName");
    const extendsSymbol = Symbol("@@extendsTagName");
    const factorySymbol = Symbol("@@factorySymbol");
    const ROOT_HTML = document.children[0];
    let Store = null;
    let _Store = null;
    let onLoad = ()=>{};
    (async ()=>{
        Store = (await import("./Component/core/store.js")).default;
        // RootStore
        //non - safe but side effect
        _Store = ROOT_HTML.$store = Store.root;
        onLoad.apply(VShadow,[_Store]);
    })()
    /**
     * @param  {HTMLElement} anyHtmlClass [description]
     * @return {Class extends BaseComponent} [description]
     */
    const BaseComponent = (anyHtmlClass) => {
        const _getParent = (_parent)=>_parent.$store instanceof Store ? _parent : _parent === ROOT_HTML ? ROOT_HTML : _getParent((_parent instanceof DocumentFragment ? _parent.host : _parent.parentNode)) ;
        const classObj = class BaseComponent extends anyHtmlClass{
            connectedCallback(){
                (async ()=>{
                    this.parent = _getParent(this.parentNode);
                    this.parent.$store.addChild(this,this.$store);
                    this.root.innerHTML = await classObj.template;
                    this.VShadow(
                        this.root,
                        this.$store
                    );
                    super.isReady = true;
                    super.connectedCallback();
                })();
            }
            attributeChangedCallback(key,oldVal,newVal){
                if(this.isReady){
                    super.attributeChangedCallback(key,oldVal,newVal);
                }
            }
            disconnectedCallback(){
                super.disconnectedCallback();
                let $child = this.parent.$store.children;
                let index = $child.indexOf(this.$store);
                if(index >= 0){
                    $child.splice(index,1)
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
                // window.customElements.whenDefined(registerdTagName).then(ElementClass.onFactory);
                if(typeof registerdTagName === "string"  && registerdTagName.includes("-")){
                    window.customElements.define(registerdTagName,ElementClass,extendsTagName);
                    if (extendsTagName !== undefined) {
                        this.extendsTag[extendsTagName] = ElementClass;
                    }
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
                    Object.assign(options,{is :extendsTag[extendsTagName]})
                }
                return document.createElement(elements,options)
                // TODO : extendsTagName이 선언된 태그 한정으로 option재생성
            }
        }
    );
})();