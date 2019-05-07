const childSymbol = Symbol("@@child");
const observeSymbol = Symbol("@@dispatchObserveAction");
const lazyObserveSymbol = Symbol("@@lazyDispatchObserveAction");
const parentSymbol = Symbol("@@parent");

const __iterateAsync = async (iterator,on = ()=>{}) => {
    let next = null;
    while(!(next = await iterator.next()).done){
        await on(next.value);
    }
}
const __iterate = (iterator,on = ()=>{}) => {
    let next = null;
    while(!(next = iterator.next()).done){
        on(next.value);
    }
}
/**
* component store storage
* @type {Map}
*
* inner source is not acting Proxy get,set
*/
let _Store = null;
let wrapProxy = (o)=>{
    return new Proxy(o,{
        set : async (obj,prop,value)=>(await obj.dispatch(prop,value,obj),true),
        get : (obj,prop)=>prop in o ? o[prop] instanceof Function ? o[prop].bind(o) : o[prop] : obj.get(prop),
        deleteProperty : (obj,key)=> obj.has(key) && obj.delete(key),
        has : (obj,key) => obj.has(key),
        ownKeys : (obj) => obj.keys(),
    })
}
const Store = class Store extends Map{
    constructor(base){
        super(base);
        this[parentSymbol] = null;
        // Store get,set proxy
        return wrapProxy(this);
    }
    clone(){
        // TODO : deep clone support
        let temp = new Store();
        __iterate(this.entries(),(v)=>temp.forceSet(...v))
        return temp;
    }
    merge(store,isIgnore = false){
        if(store instanceof this.constructor){
            __iterate(store.entries(),([k,v])=>{
                if(!this.has(k) || isIgnore){
                    this.forceSet(k,v);
                }
            })
            return this;
        }
        else{
            throw new Error("only store object can merge");
        }
    }
    get children(){
        return this.init(childSymbol,[]);
    }
    get parent(){
        return this.get(parentSymbol);
    }
    static get root(){
        return _Store instanceof Store ? _Store : _Store = new Store();
    }
    get root(){
        return this.constructor.root;
    }
    forceSet(k,v){
        super.set.apply(this,[k,v]);
        return v;
    }
    lazyDispatch(k,v){
        return this.init(lazyObserveSymbol).forceSet(k,v);
    }
    async dispatch(k,v){
       this.forceSet(k,v);
       await this.commit(k,v);
       return v;
    }
    async commit(k,v,store = this,commitAction){
        const oldValue = store.get(k);
        const handlerMap = this.get(observeSymbol);
        if(handlerMap instanceof Store){
            let handlers = handlerMap.get(k);
            let handlerArr = (Array.isArray(handlers) ? handlers : []);
            let iterator = handlerArr[Symbol.iterator]();
            if(!commitAction){
                await __iterateAsync(iterator,async (handler)=>await handler(oldValue,v))
            }
        }
    }
    async commitParents(k,v,store = this){
        let parentStore = store.get(parentSymbol);
        if(parentStore instanceof Store){
            if(store.root !== parentStore && !parentStore.isAttach(k)){
                return await store.commitParents(k,v,parentStore);
            }
            else{
                await parentStore.commit(k,v);
            }
        }
    }
    async commitChilds(k,v,store = this){
        let childs = store.children;
        await __iterateAsync(childs[Symbol.iterator](),async($s)=>{
            if(!$s.isAttach(k)){
                await $s.commitChilds(k,v,$s);
            }
            else{
                await $s.commit(k,v);
            }
        })
    }
    async dispatchChild(k,v){
        let state = await __iterateAsync(this.children[Symbol.iterator](),async ($store)=>await $store.dispatch(k,v));
        return this;
    }
    addChild(child = new Store(),o){
        if(!(o instanceof Store)){
            o = this;
        }
        child.forceSet(parentSymbol,o);
        o.children.push(child);
        return child;
    }
    removeChild(o){
        let index = this.children.indexOf(o);
        let cond = index >= 0;
        if(cond){
            this.children.splice(index,1);
        }
        return cond;
    }
    init(o,v = new Store()){
        return (!this.has(o)) ? (this.forceSet(o,v),v) : this.get(o);
    }
    hasChild(o){
        return this.children.includes(o);
    }
    isAttach(prop){
        let $observeStore = null;
        return !!($observeStore = this.get(observeSymbol)) && $observeStore.has(prop) && $observeStore.get(prop).length > 0;
    }
    attach(prop,...action){
        const observeStore = this.init(observeSymbol);
        const nonHandler = action.filter((f)=>!(f instanceof Function));
        const observeHandlers = observeStore.get(prop);
        let lazyStore = null;
        let tempValue = null;
        if(nonHandler.length > 0){
            throw new Error(`is't compatible at [${nonHandler.join(",")}}]`)
        }
        observeStore.forceSet(prop,(Array.isArray(observeHandlers) ?  observeHandlers : []).concat(action));
        if((lazyStore = this.get(lazyObserveSymbol)) instanceof Store && (tempValue = lazyStore.get(prop))){
            this.commit(prop,tempValue,lazyStore);
        }
        return wrapProxy(this);
    }
}

export default Store;
export {Store,childSymbol,observeSymbol,lazyObserveSymbol,parentSymbol}