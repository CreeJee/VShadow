const childSymbol = Symbol("@@child");
const observeSymbol = Symbol("@@dispatchObserveAction");
const lazyObserveSymbol = Symbol("@@lazyDispatchObserveAction");
const parentSymbol = Symbol("@@parent");

const __iterateAsync = async (iterator,on = ()=>{},onFail) => {
    let next = null;
    let res = [];
    let k = 0;
    let isFail = false;
    for await(let handler of iterator){
        try{
            await on(handler,k);
        }
        catch(e){
            if (isFail = (typeof onFail === "function")){
                break;
            }
            else{
                throw e;
            }
        }
        k++;
    }
    if(isFail){
        return await __iterateAsync(iterator,onFail);
    }
    return res;
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
};

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
        return wrapProxy(this.get(parentSymbol));
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
        let oldValue = this.get(k);
        this.forceSet(k,v);
        await this.commit(k,v,this,oldValue);
        return v;
    }
    async commit(k,v,store = this,oldValue = store.get(k)){
        const handlerMap = store.get(observeSymbol);
        if(handlerMap instanceof Store){
            let handlers = handlerMap.get(k);
            let handlerArr = (Array.isArray(handlers) ? handlers : []);
            let iterator = handlerArr[Symbol.iterator]();
            await __iterateAsync(
                iterator,
                async (handler)=>await handler(oldValue,v),
                async (handler)=>await handler(v,oldValue)
            )
        }
    }
    async commitParents(k,v,store = this,beforeCommit = ()=>{}){
        let parentStore = store.get(parentSymbol);
        if(parentStore instanceof Store){
            if(store.root !== parentStore && !parentStore.isAttach(k)){
                return await store.commitParents(k,v,parentStore,beforeCommit);
            }
            else{
                await beforeCommit(k,v,parentStore,beforeCommit);
                await parentStore.commit(k,v);
            }
        }
    }
    async commitChilds(k,v,store = this,beforeCommit = ()=>{}){
        let childs = store.children;
        await __iterateAsync(
            childs[Symbol.iterator](),
            async ($s)=>{
                if(!$s.isAttach(k)){
                    await $s.commitChilds(k,v,$s,beforeCommit);
                }
                else{
                    await beforeCommit(k,v,$s,beforeCommit);
                    await $s.commit(k,v,$s);
                }
            },
            async ($s)=>{
                debugger;
                // sliblings를 찾다 에러가 나지 않을걸 알기에
                if($s.isAttach(k)){
                    await beforeCommit(k,v,$s,beforeCommit);
                    await $s.commit(k,v,$s);
                }
            }
        )
    }
    async dispatchChild(k,v){
        // not rollback
        let oldGroup = this.children.map($store=>$store.get(k));
        let dispatchedResult = await __iterateAsync(
            this.children[Symbol.iterator](),
            async ($store)=>await $store.dispatch(k,v),
            async ($store,index)=>await $store.dispatch(k,oldGroup[index]),
        );
        return this;
    }
    addChild(child = new Store()){
        child.forceSet(parentSymbol,this);
        this.children.push(child);
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
    detech(prop,...action){
        let $attachStore = this.init(observeSymbol).init(prop,[]);
        if (action.length === 0) {
            $attachStore.splice(0,Infinity);
        }
        else{
            for (var i = 0; i < action.length; i++) {
                let index = $attachStore.indexOf(action[i]);
                if(index >= 0){
                    $attachStore.splice(index,1);
                }
            }
        }
    }
}

export default Store;
export {Store,childSymbol,observeSymbol,lazyObserveSymbol,parentSymbol}