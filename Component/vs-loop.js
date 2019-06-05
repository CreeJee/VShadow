import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import {Store,observeSymbol} from "./core/store.js";
import {getRelativeUrl} from "./core/util.js";

// store attach iterate symbol to slot tag
// https://alligator.io/web-components/composing-slots-named-slots/
const iterateSymbol = Symbol("@@IterateSymbol");
const onRenderSymbol = Symbol("@@OnRenderSymbol");
const assignedElementsSymbol = Symbol("@@assignedElements");
const isParentIterate = Symbol("@@isParentIterate");

const getRangeArray = (start,total)=>(Array.from({ length: ((total) - start) }, (_, i) => ({}) || []) )
const getWrappedChilds = (children,renederPerElement)=>Array.from(children).reduce((accr,v,k,arr)=>(k % renederPerElement === 0 ? accr.push([v]) : accr[Math.floor(k/renederPerElement)].push(v),accr) ,[])
//@name getWrappedChilds
// child elements wrapping for one loop Render Array
// for example
/*  
    <vs-loop count="2" start="0">
        <p>test1</p>
        <p>test2</p>
    </vs-loop>

    then we changed
    [Node,Node,Node,Node] to [[Node,Node],[Node,Node]]
 */
const limitChange = async function(assignedElements,key,value){
    let $store = this.$store;
    let start =  $store.get("start");
    let total = $store.get("total");
    let renederPerElement = assignedElements.length;
    let data = $store.get("data");
    
    let childNodeArray = getWrappedChilds(this.children,renederPerElement);
    if(key === "as"){
        $store.set("as",data = value);
        $store.set("data",data);
        $store.set("total",total = data.length);
    }
    if(Array.isArray(data)){
        let len = data.length;
        $store.set("data",data = (len >= total ? data.slice(start,total) : data.concat( getRangeArray(0,total-len) )));
        $store.set("total",data.length);
    }
    else{
        $store.set("data",data = getRangeArray(start,total))
    }
    // TODO : 지워질태그가 dispatch 되는 부분에 대하여 메모리 낭비 해결

    // INSERT 후 UPDATE하는 처리로 변경
    let updateCount = -1;
    await VSEventCore.asyncForEach(
        data.slice(updateCount = childNodeArray.length),
        async (v,k,arr)=>{
            await VSEventCore.dispatchAppend(assignedElements,this,iterateSymbol,[v,updateCount+k]);
        }
    );
    await VSEventCore.asyncForEach(
        data.slice(0,updateCount),
        async (v,k,arr)=>{
            let selectedChild = childNodeArray[k];
            await VSEventCore.asyncForEach(
                selectedChild.flatMap(
                    function __recursive__(n,i,a,result){
                        result = Array.from(n.children);
                        return (n instanceof VSElement) ? [n] : (result.length > 0) ? result.flatMap(__recursive__) : [];
                    }
                ),
                async (node)=> await node.$store.dispatch(iterateSymbol,[v,k])
            );
        }
    )
    getWrappedChilds(this.children,renederPerElement).filter((v,i)=>data[i] === undefined).flatMap((v)=>v).forEach((node)=>{
        node.remove();
    });

    
    await $store.commit(onRenderSymbol,$store);
};
const VSLoopGen = (superClass) => class VSLoop extends VSElement.extend(superClass){
    constructor(){
        super();
        let externClass = VSLoopGen(superClass); 
        this.$store.attach(iterateSymbol,async (_,[v,k])=>{
            let data = v;
            let computedExpr = this.getAttribute("as");
            let key = computedExpr ? "as" : "data";
            const assignedElements = this.$store.get(assignedElementsSymbol);
            if(computedExpr){
                data = VSEventCore.parseExpression.call(this,{value : v,key: k},this.getAttribute("as"));
            }
            if(assignedElements){
                await limitChange.call(this,assignedElements,key,data);
            }
            else{
                await this.$store.dispatch(key,data);
            }
        });
    }
    get [isParentIterate](){
        let parentStore = this.parent.$store;
        let isIterateObserve = parentStore.isAttach(iterateSymbol);

        //not attached or initalize complete
        return !(this.parent instanceof VSLoop) && !isIterateObserve || ( isIterateObserve && Array.isArray(parentStore[observeSymbol][iterateSymbol]) && parentStore[observeSymbol][iterateSymbol].length > 0 && this.$store.as instanceof Object);
    }
    static [Symbol.hasInstance](instance) {
        return instance.constructor[iterateSymbol] === iterateSymbol;
    }
    static get template(){
        return fetch(`${getRelativeUrl(import.meta.url)}/dom/base/vs-loop.html`).then((res)=>res.text());
    }
    static get [VShadow.tagNameSymbol](){
        return "vs-loop";
    }
    static get observedAttributes() {
      return ['start','total','data','as'];
    }
    static get iterateSymbol(){
        return iterateSymbol;
    }
    static get onRenderSymbol(){
        return onRenderSymbol;
    }
    static extend(superClass){
        return VSLoopGen(superClass);
    }
    async VShadow(root,$store){
        const assignedElements = ((this.isShadow) ? root.getElementById("slot").assignedElements() : Array.from(this.children));

        $store.set(assignedElementsSymbol,assignedElements);
        if(this[isParentIterate]){
            let temp = -1;
            let iterateStart = $store.has("start") ? $store.get("start") : this.getAttribute("start");
            let iterateTotal = $store.has("total") ? $store.get("total") : this.getAttribute("total");
            let iterateAs = this.getAttribute("as");
            let iterateAsArray = $store.get("as");
            iterateAsArray = Array.isArray(iterateAsArray) ? iterateAsArray : []; 
            let fillEnd = -1;
            let [value,key] = Array.isArray(this.$store[iterateSymbol]) ? this.$store[iterateSymbol] : [];
            let store = {value,key};

            // 초기 initalize시 정책적으로 어떠한 오브젝트를 expression을 통해 파싱할지...
            await $store.dispatch("start",iterateStart = iterateStart ? (isNaN(temp = parseInt(iterateStart)) ? VSEventCore.parseExpression.apply(this,[store,iterateStart]) : temp ) : 0);
            await $store.dispatch("total",iterateTotal = iterateTotal ? (isNaN(temp = parseInt(iterateTotal)) ? VSEventCore.parseExpression.apply(this,[store,iterateTotal]) : temp ) : (iterateAsArray.length || undefined)); 
            fillEnd = iterateTotal;
            if(iterateAsArray.length === 0){
                try{
                	let temp = null;

                    $store.forceSet("data",
                    	iterateAsArray = ( 
                    		iterateAs 
                    			? 
	                    			(
	                    				$store.forceSet(
	                    					"as",
	                    					(
	                    						(
	                    							temp = VSEventCore.parseExpression.apply(this,[store,iterateAs]),
	                    							Array.isArray(temp)
	                    						)
	                    							?
	                    								temp
	                    							:
	                    								(
	                    									typeof temp === "object"
	                    										?
	                    											Object.entries(temp).reduce((accr,[k,v])=>(accr[k]=v,accr),[])
	                    										:
	                    											[]
	                    								)

	                    					)
	                    				)
	                    			)
	                    			.slice(iterateStart,fillEnd) 
	                    		: 
	                    			getRangeArray(iterateStart,fillEnd)
	                    ) 
                    );
                }
                catch(e){
                    throw new Error(`undefined variable on ${iterateAs}]`);
                }
            }
            else if(iterateAsArray.length > 0){
                $store.forceSet("data",iterateAsArray);
            }
            assignedElements.forEach((node)=>node.remove());
            // dispatch new generate and cached
            await VSEventCore.asyncForEach(
                iterateAsArray,
                async (v,k)=>await VSEventCore.dispatchAppend(assignedElements,this,iterateSymbol,[v,k])
            )
    
    
            await $store.commit(onRenderSymbol,$store);
        }

        if(!$store.isAttach("start")){
            $store.attach("start",(_,$v)=>limitChange.call(this,assignedElements,"start",$v));
            $store.attach("total",(_,$v)=>limitChange.call(this,assignedElements,"total",$v));
            $store.attach("data",(_,$v)=>limitChange.call(this,assignedElements,"data",$v));
            $store.attach("as",(_,$v)=>limitChange.call(this,assignedElements,"as",$v));
        }
    }
    //on dom attached
    connectedCallback(){
    }
    //on dom deteched
    disconnectedCallback(){

    }
    //on attribute change
    attributeChangedCallback(key,oldVal,newVal){
        let temp = 0;
        let asAttribute = this.getAttribute("as");
        return this.$store.dispatch(key,isNaN(temp = parseInt(newVal)) ? VSEventCore.parseExpression.apply(this,[{value : this.$store[asAttribute ? "as" : "data"]},newVal]) : temp);
    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}
export default VSLoopGen(HTMLElement);