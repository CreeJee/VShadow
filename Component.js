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
                this.root = this.attachShadow({mode: 'open'});
                this.root.innerHTML = await this.template;
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
            get template(){
                return Promise.reject(new Error(`need implements [${this.name}.template]`));
            }
            //custom elements spec
            static async onRegister(){
                return Promise.reject(new Error(`need implements [async ${this.name}.onRegister()]`));
            }
            //on dom attached
            connectedCallback(){

            }
            //on dom deteched
            disconnectedCallback(){

            }
            //on attribute change
            attributeChangedCallback(key,oldVal,newVal){

            }
            //moved other document
            adoptedCallback(oldDoc, newDoc) {

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
                    (res)=>{throw new Error(`duplicated Tag [name : ${registerdTagName}]`)}
                );
                window.customElements.define(registerdTagName,ElementClass,extendsTagName);
                ElementClass.onRegister();
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