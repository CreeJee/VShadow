import VSEventCore from "./core/event.js";
import VSElement from "./core/vs-element.js";
import Store from "./core/store.js";
import {getRelativeUrl} from "./core/util.js";

// store attach iterate symbol to slot tag
// https://alligator.io/web-components/composing-slots-named-slots/
const iterateSymbol = Symbol("@@IterateSymbol");
const onRenderSymbol = Symbol("@@OnRenderSymbol");
const getRangeArray = (start,total)=>Array.from({ length: ((total) - start) }, (_, i) => ({}) )
const getWrappedChilds = (children,renederPerElement)=>Array.from(children).reduce((accr,v,k,arr)=>(k % renederPerElement === 0 ? accr.push([v]) : accr[Math.floor(k/renederPerElement)].push(v),accr) ,[])
const limitChange = function(assignedElements,key,value){
    let $store = this.$store;
    let start =  $store.get("start");
    let total = $store.get("total");
    let renederPerElement = assignedElements.length;
    let data = $store.get("data");
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
    let childNodeArray = getWrappedChilds(this.children,renederPerElement);
    if(key === "as"){
        $store.set("as",data = value);
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
    data.forEach((v,k,arr)=>{
        let selectedChild = childNodeArray[k];
        if(!Array.isArray(selectedChild)){
            VSEventCore.dispatchAppend(assignedElements,this,iterateSymbol,[v,k]);
        }
        else{
            selectedChild.forEach((node)=>{
                if(node.$store instanceof Store){
                    node.$store.dispatch(iterateSymbol,[v,k]);
                }
            })
        }
    });
    getWrappedChilds(this.children,renederPerElement).filter((v,i)=>data[i] === undefined).flatMap((v)=>v).forEach((node)=>{
        node.remove();
    });

    
    $store.commit(onRenderSymbol,$store);
};
const VSLoopGen = (superClass) => class VSLoop extends VSElement.extend(superClass){
    constructor(){
        super();
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
        const attributes = this.attributes;
        const assignedElements = (this[VSElement.notShadowSymbol]) ? Array.from(this.children) : root.querySelector("#slot").assignedElements();
        let temp = -1;
        let iterateStart = null,iterateTotal = null;
        let iterateAsArray = [];
        let fillEnd = -1;
        $store.set("start",iterateStart = attributes.start ? (isNaN(temp = parseInt(attributes.start.value)) ? VSEventCore.parseExpression(this,attributes.start.value) : temp ) : 0);
        $store.set("total",iterateTotal = attributes.total ? (isNaN(temp = parseInt(attributes.total.value)) ? VSEventCore.parseExpression(this,attributes.total.value) : temp ) : (iterateAsArray.length || undefined)); 
        fillEnd = iterateTotal;
        try{
            $store.set("data",iterateAsArray = attributes.as ? ($store.forceSet("as",VSEventCore.parseExpression(this,attributes.as.value) || [])).slice(iterateStart,fillEnd) : getRangeArray(iterateStart,fillEnd));
        }
        catch(e){
            throw new Error(`undefined variable on [${attributes.as.value}]`);
        }
        debugger;
        
        assignedElements.forEach((node)=>{
            node.remove();
        });
        // dispatch new generate and cached
        iterateAsArray.forEach((v,k)=>{
            VSEventCore.dispatchAppend(assignedElements,root.host,iterateSymbol,[v,k]);
        });
        $store.attach("start",limitChange.bind(this,assignedElements,"start"));
        $store.attach("total",limitChange.bind(this,assignedElements,"total"));
        $store.attach("data",limitChange.bind(this,assignedElements,"data"));
        $store.attach("as",limitChange.bind(this,assignedElements,"as"));

        $store.commit(onRenderSymbol,$store);
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
        return this.$store.dispatch(key,isNaN(temp = parseInt(newVal)) ? VSEventCore.parseExpression(this,newVal) : temp);
    }
    //moved other document
    adoptedCallback(oldDoc, newDoc) {

    }
}
export default VSLoopGen(HTMLElement);