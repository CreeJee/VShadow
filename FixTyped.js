const FixedType = (()=>{
    /********************
    *  basic variables  *
    *********************/
    const parentSymbol = Symbol("@@Parent");
    const TypeListSymbol = Symbol("@@TypeList");

    const __justValueSettings = Object.freeze({ 
        enumerable: false,
        configurable: false,
        writable: false
    });
    /**
     *obj convert as Function or value
     * @param {Any} obj
     * @returns {(Function)} when convert (success)
     */
    const justConstructor = (obj)=> {
        return (obj === null || obj === undefined) ? function(){} : typeof obj === "function" ? obj : obj.constructor;
    }
    const justConstructors = (...data) => {
        return data.map(justConstructor);
    }
    const constructorFilter = (v,temp)=>(temp = justConstructor(v)) ? temp.name : v;
    const constructorsGain = (args)=>args.map(constructorFilter);

    /**
     *definePropery suger
     *
     * @param {Any} target
     * @param {Any} prop
     * @param {Any} value
     * @returns
     */
    const justValueProp = (target,prop,value) => {
        Object.defineProperty(target,prop,Object.assign(
            {},
            __justValueSettings,
            {
                value : value
            }
        ));
        return target;
    };
    const justValueProps = (target,obj)=>{
        Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)).forEach( (k)=>{
            obj[k] = Object.assign({},__justValueSettings,{value : obj[k]})
        });
        Object.defineProperties(target,obj);
        return target;
    }
    const expectBinder = (parent,obj)=>{
        let child = null;
        return parent.has(obj) ? parent.get(obj) :(parent.set(obj,child = new Map()),justValueProp(child,parentSymbol,parent),child)
    };
    const expectHandler = {
        apply : (target,thisArg,args)=>{
            FixedType.Instance.__get(target,...justConstructors(...args));
            return Reflect.apply(target,thisArg,args);
        },
        construct : (target,args,newTarget)=>{
            FixedType.Instance.__get(newTarget,...justConstructors(...args));
            return Reflect.construct(target,args,newTarget);
        }
    };
    const PropertyHandler = {
        set : (obj,prop,value)=>{
            try{
                FixedType.Instance.__get(obj,prop,justConstructor(value));
                return Reflect.set(obj,prop,value);
            }
            catch(e){
                throw new TypeError(`non Matched Type as Value : ${justConstructor(e.nonMatches[1]).name}`)
            }
        }
    };


    /**
     * fixed type method then expect
     * @static
     * @param  {Object} caller proxy chain Function caller
     * @param  {ProxyHandler} ProxyHandler proxyHandler custom action
     * @param  {Function} func expext type for each arguments
     * @param  {...Type} args type as Function
     * @return {Proxy<Function>} return this
     * 
     * please do not break type instead of create new Type
     */
    const __expect = (chainedName,proxyHandler,value,...args) =>{
        let proxyValue = null;
        (typeof value[TypeListSymbol] === "object" ? value[TypeListSymbol] : {}) instanceof Map ? proxyValue = value : (justValueProps((proxyValue = new Proxy(value,proxyHandler)),{
            [TypeListSymbol] : new Map(),
            [chainedName] : __expect.bind(proxyValue,chainedName,proxyHandler,proxyValue)
        }));
        args.reduce(expectBinder , proxyValue[TypeListSymbol]);
        return proxyValue;
    }

    /********************
    *  addons attached  *
    *********************/
    const FixedBaseType = class FixedBaseType{
        /**
         * @type {Function}
         * @readonly
         */
        static action(parent,action){
        }
        isVaild(Type){
            let temp = null;
            return typeof Type === "function" ? (Type === this.TypeClass ? true : (temp = Object.getPrototypeOf(Type),temp !== Object && temp.name) ? this.isVaild(temp) : false) : false;
        }
        same(type){
            return this.TypeClass === type;
        }
        constructor(TypeClass){
            this.TypeClass = TypeClass;
        }
    }
    const FixedTypeSpread = class Spread extends FixedBaseType{
        static action(parent,obj){
            const objType = justConstructor(obj);
            return Array.from(parent.keys()).find((typeInstance)=>typeInstance.same(objType)) ? parent : null;
        }
        /**
         *Creates an instance of FixedType.Spread.
         * @param {Function|T} TypeClass
         */
        constructor(TypeClass){
            super(TypeClass);
        }
    };
    const FixedOrigin = class FixedOrigin extends FixedBaseType{
        static action(parent,obj){
            let result = null;
            Array.from(parent.keys()).find((typeInstance)=>{
                try{
                    result = FixedType.Instance.__searchExtendTree(parent,obj);
                }
                catch(e){
                }
                return result;
            })
        }
        constructor(TypeClass){
            super(TypeClass)
        }
    } 
    /***********************
    *  FixedType Instance  *
    ************************/
    let FixedTypeInstance = null;
    /**
     *Type Fixed Class
     *
     * @class FixedType
     */
    class FixedType{
        /**
         *Creates an instance of FixedType.
         * @memberof FixedType
         */
        constructor(){
            justValueProps(this,{
                "__useProps__" : [
                    FixedTypeSpread
                ],
            })
            return this;
        }
        /**
         *
         * @description Singletone
         * @readonly
         * @static
         * @memberof FixedType
         */
        static get Instance(){
            return (FixedTypeInstance === null) ? FixedTypeInstance = new FixedType() : FixedTypeInstance;
        }
        
        /**
         * use MiddleFilter
         * @param {FixedType.BaseType} {Type,action}
         * @returns {FixedType} return fixed type
         * @memberof FixedType
         */
        use(...baseTypes){
            baseTypes.filter((type)=>type instanceof FixedType.BaseType).forEach((baseTypes)=>this.__useProps__.push(baseTypes));
            return this;
        }    
        /**
        * fixed type method then expect
        * @static
        * @param  {Function} func expext type for each arguments
        * @param  {...Type} args type as Function
        * @return {FixedType} return this
        * @memberof FixedType
        * @todo arguments 에 middleware Binder재공
        * 
        * please do not break type instead of create new Type
        */
        static expect(func,...args){
            return __expect("expect",expectHandler,func,...args);
        }
        /**
         *fixed type property setter
         *
         * @static
         * @param {Object} referencedObj
         * @param {...{Type|Function}} Type
         * @memberof FixedType
         */
        static property(referencedObj){
            return __expect("expect",PropertyHandler,referencedObj);
        }
        /**
         * Type handler Interfacce
         * @readonly
         * @static
         * @memberof FixedType
         */
        static get BaseType(){
            return FixedBaseType;
        }
        static Spread(Type){
            return new FixedTypeSpread(Type);
        }
        
        /**
         * @private
         * @param {Map} parent Derived from TypeListSymbol
         * @param {Any} obj the constructor for each Arguments
         * @return {Boolean} is middleWare success
        */
        __callMiddleWare(parent,obj){
            const types = Array.from(parent.keys());
            let res = this.__useProps__.filter(
                (Type) => types.find(
                    (metaObj) => (
                        metaObj instanceof Type && metaObj.isVaild(obj)
                    )
                )
            );
            return res.length > 0 ? res.reduce((parent/*accr*/,v)=>v.action(parent,obj),parent) : false;
        }
        /**
         * @private 
         * @param {Function} func referenced function
         * @param {...Any} args argument object
         * @return {Boolean} is expect for function call
         * @throws {TypeError}
        */
        __get(func,...args){
            let middlewareResult = null;
            let errorObj = new TypeError(`not Matching Type [in : ${constructorsGain(args).join(",")}]`);
            args.reduce((parent/*accr*/,obj)=>{
                if(
                    parent.has(obj) ||
                    (typeof obj === "function" ? !!this.__searchExtendTree(parent,obj) : false) ||
                    (obj !== null && obj !== undefined && typeof obj[Symbol.hasInstance] === "function" ? !!Array.from(parent.keys()).find(obj[Symbol.hasInstance]) : false) ||
                    !!(middlewareResult = this.__callMiddleWare(parent,obj)) === true
                )
                {
                    return middlewareResult ? middlewareResult : parent.get(obj);
                }
                errorObj.nonMatches = args;
                throw errorObj;
            },func[TypeListSymbol]);
                
        }
        /**
         * get closest vaild parent 
         * @param  {Map} parent             [from [TypeListSymbol]]
         * @param  {Function} classLike     [function Class,es6 class,etc...]
         * @return {Function}                [that extended class]
            */
            __searchExtendTree(parent,classLike){
                if(parent instanceof Map && classLike instanceof Function){
                    return ( 
                        ( 
                        (classLike = Object.getPrototypeOf(classLike)) && 
                        classLike !== Object && 
                        classLike.name
                    ) ? 
                        (parent.has(classLike) ? 
                        classLike : 
                        this.__searchExtendTree(parent,classLike)) : 
                    false
                );
            }
            throw new Error(`need arguments [Map,ClassLike]`);
            
        }
        /**
         *use clear already binding middleware Elements
         *
         * @memberof FixedType
         */
        clear(){
            this.__useProps__.splice(0);
        }
    }
    return FixedType;
})()