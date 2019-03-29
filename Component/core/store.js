// TODO : Store들을 async하게 바꾸기
const childSymbol = Symbol("@@child");
const observeSymbol = Symbol("@@dispatchObserveAction");
const lazyObserveSymbol = Symbol("@@lazyDispatchObserveAction");

/**
* component store storage
* @type {Map}
*/
let _Store = null;
export default class Store extends Map{
    constructor(base){
        super(base);
        // Store get,set proxy
        return new Proxy(this,{
            set : (obj,prop,value)=>(obj.dispatch(prop,value,obj),true),
            get : (obj,prop)=>prop in this ? this[prop] instanceof Function ? this[prop].bind(this) : this[prop] : obj.get(prop)
        })
    }
    clone(){
        // TODO : deep clone support
        let temp = new Store();
        let iterator = this.entries();
        let next = null;
        while(!(next = iterator.next()).done){
            temp.set.apply(temp,next.value);
        }
        return temp;
    }
    merge(store,isIgnore = false){
        if(store instanceof this.constructor){
            let iterator = store.entries();
            let next = null;
            while(!(next = iterator.next()).done){
                let [k,v] = next.value;
                if(this.has(k) && !isIgnore){
                    continue;
                }
                this.set(k,v);
            }
        }
        else{
            throw new Error("only store object can merge");
        }
    }
    get children(){
        return this.init(childSymbol,[]);
    }
    static get root(){
        return _Store instanceof Store ? _Store : _Store = new Store();
    }
    get root(){
        return this.constructor.root;
    }
    forceSet(k,v){
        this.set(k,v);
        return v;
    }
    lazyDispatch(k,v){
        return this.init(lazyObserveSymbol).forceSet(k,v);
    }
    dispatch(k,v){
       this.set(k,v);
       this.commit(k,v);
       return v;
    }
    commit(k,v,store=this){
        const oldValue = store.get(k);
        const handlerMap = this.get(observeSymbol);
        if(handlerMap instanceof Store){
            let handlers = handlerMap.get(k);
            let iterator = (Array.isArray(handlers) ? handlers : [])[Symbol.iterator]();
            let next = null;
            while(!(next = iterator.next()).done){
                next.value(oldValue,v);
            }
        }
    }
    addChild(o,child = new Store()){
        if(!(o instanceof Store)){
            o = this;
        }
        o.children.push(child);
        return child;
    }
    dispatchChild(k,v){
        let iterator = this.children[Symbol.iterator]();
        let next = null;
        while(!(next = iterator.next()).done){
            next.value.dispatch(k,v);
        }
        return this;
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
        return (!this.has(o)) ? (this.set(o,v),v) : this.get(o);
    }
    hasChildren(o){
        return this.children.includes(o);
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
        observeStore.set(prop,(Array.isArray(observeHandlers) ?  observeHandlers : []).concat(action));
        if((lazyStore = this.get(lazyObserveSymbol)) instanceof Store && (tempValue = lazyStore.get(prop))){
            this.commit(prop,tempValue,lazyStore);
        }
        return this;
    }
}
