
const childSymbol = Symbol("@@child");
const observeSymbol = Symbol("@@dispatchObserveAction");
const lazyObserveSymbol = Symbol("@@lazyDispatchObserveAction");

/**
* component store storage
* @type {Map}
*/

export default class Store extends Map{
    constructor(){
        super();
        // Store get,set proxy
        return new Proxy(this,{
            set : (obj,prop,value)=>obj.dispatch(prop,value),
            get : (obj,prop)=>prop in this ? this[prop] instanceof Function ? this[prop].bind(this) : this[prop] : obj.get(prop)
        })
    }
    forceDispatch(k,v){
        return this.set(k,v);
    }
    lazyDispatch(k,v){
        return this.init(lazyObserveSymbol).set(k,v);
    }
    dispatch(k,v){
       const newValue = this.set(k,v);
       this.commit(v,newValue);
       return newValue;
    }
    commit(k,v,store=this){
        const oldValue = store.get(k);
        const handlerMap = this.get(observeSymbol);
        let handlers = null;
        if(handlerMap instanceof Store){
           handlers = handlerMap.get(k);
           (Array.isArray(handlers) ? handlers : []).forEach((handle)=>handle(oldValue,v));
        }
    }
    addChild(o){
        return this.init(childSymbol).init(o);
    }
    init(o,v = new Store()){
        return (!this.has(o)) ? (this.set(o,v),v) : this.get(o);
    }
    getChild(o){
        return this.get(childSymbol).get(o);
    }
    get root(){
        return _Store instanceof Store ? _Store : _Store = new Store();
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
        Array.isArray(observeHandlers) ?  observeHandlers.concat(action) : observeStore.set(prop,action);
        if((lazyStore = this.get(lazyObserveSymbol)) instanceof Store && (tempValue = lazyStore.get(prop))){
            this.commit(prop,tempValue,lazyStore);
        }
    }
}