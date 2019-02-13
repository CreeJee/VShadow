/********************
*  custom elements  *
*********************/
const elementRegistry = (()=>{
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
                this.root.innerHTML = this.innerHTML;
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
        class ElementRegistry{
            get tagNameSymbol(){
                return tagNameSymbol;
            }
            get extendsSymbol(){
                return extendsSymbol;
            }
            constructor(){
                this.define = FixedType.expect(this.define,HTMLElement);
                this.loadComponents = FixedType.expect(this.loadComponents,FixedType.Spread(String));
                this.definedTag = [];
                // FixedType.property(this)
                //         .expect("foo",String)
                //         .expect("bar",Boolean);
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
                debugger;
            }
            /**
             * @return {Promise<ElementRegistry.Component>}
             * @param {String[]} src
             */
            async loadComponents(...src){
                const getPath = (path) => `${path}`;
                const scriptSettings = {
                    method : "get",
                    mode : "cors",
                    cache: 'default'

                };
                await Promise.all(
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
                    /*JSX like 꼴의 표현식 적용 을 골라야하는데*/
                )
                return this;
            }
        }
    );
})();