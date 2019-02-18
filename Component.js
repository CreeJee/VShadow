/********************
*  custom elements  *
*********************/
const VShadow = (()=>{
    const tagNameSymbol = Symbol("@@tagName");
    const extendsSymbol = Symbol("@@extendsTagName");
    /**
     * @param  {HTMLElement} anyHtmlClass [description]
     * @return {Class extends BaseComponent} [description]
     */
    const BaseComponent = (anyHtmlClass) => {
        const classObj = class BaseComponent extends anyHtmlClass{
            constructor(){
                super();
                (async ()=>{
                    this.root = this.attachShadow({mode: 'open'});
                    this.root.innerHTML = await classObj.template;
                    this.VShadow(this.root);
                })()
                // some property required
                //some action needs
            }
            static get [tagNameSymbol](){
                const tagName = super[tagNameSymbol];
                if(tagName === undefined){
                    throw new Error(`need implements [${this.name}.${tagNameSymbol.toString()}]`);
                }
                else if(typeof tagName === "string"  && tagName.includes("-")){
                    return tagName;
                }
                else{
                    throw new Error(`need well-formated tagName [${this.name}.${tagNameSymbol.toString()}]`);
                }
            }
            static get [extendsSymbol](){
                return super[extendsSymbol];
            }
            static get template(){
                let temp;
                return (temp = super.template) ? temp :Promise.reject(new Error(`need implements [${this.name}.template]`));
            }
            async VShadow(...args){
                let temp;
                return (temp = super.VShadow) instanceof Function ? temp(...args) : Promise.reject(new Error(`need implements [async ${this.name}.VShadow()]`));
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
            constructor(){
                this.define = FixedType.expect(this.define,HTMLElement);
                this.load = FixedType.expect(this.load,FixedType.Spread(String));
                this.definedTag = {};
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
                window.customElements.whenDefined(registerdTagName).then(
                    ()=>{
                        // throw new Error(`duplicated Tag [name : ${registerdTagName}]`)
                    }
                );
                window.customElements.define(registerdTagName,ElementClass,extendsTagName);
                return this.definedTag[registerdTagName] = ElementClass;
            }
            /**
             * @return {Promise<ElementRegistry.Component>}
             * @param {String[]} src
             */
            async load(...src){
                return await Promise.all(
                    src.map((path)=>import(path))
                ).then(
                    (scriptSources)=>scriptSources.map((object,index)=>{
                        try{
                            return this.define(object.default);
                        }
                        catch(e){
                            throw new Error(`it needs extends HTMLElement [soruce : ${src[index]}]`);
                        };
                    })
                )
            }
        }
    );
})();