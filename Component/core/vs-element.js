import Store from "./store.js";
import VSEvent from "./event.js";
const notShadowSymbol = Symbol("@@notShadow");
const $root = Store.root;
const __delegate = (selector,isRoot,self,e)=>{
    let path = e.path;
    return Array.from((isRoot ? self.root : self).querySelectorAll(selector)).find((n)=>path.slice(0,path.indexOf(self)).includes(n))
}
function VSElement(superConstructor = HTMLElement){
    if(!(Object.getPrototypeOf(superConstructor) === HTMLElement || superConstructor === HTMLElement)){
        throw new Error("need extends HTMLElement");
    }
    return class __VSElement__ extends superConstructor{
        constructor(){
            super();
            try{
                this.root = this.attachShadow({mode: 'open'});
            }
            catch(e){
                // TODO root와 host는 document-fragment로 최적화를 손보자
                this.root = this;
                this.root.host = this;
                this[notShadowSymbol] = true;
            }
            this.$store = new Store([["self",this]]);
            this.isReady = false;
        }
        static extend(superConstructor){
            return VSElement(superConstructor);
        }
        static get template(){
            return Promise.reject(new Error(`need implements [${this.name}.template]`));
        }
        static get notShadowSymbol(){
            return notShadowSymbol;
        }
        async VShadow(...args){
            return Promise.reject(new Error(`need implements [async ${this.name}.VShadow()]`));
        }
        on(type,selector,resolve,reject=()=>{}){
            let result = Array.from(this.querySelectorAll(selector));
            if(result.length === 0){
                reject();
            }
            result.forEach((node)=>node.addEventListener(type,resolve))
            // TODO : change tree travel
        }
        delegate(type,cond=()=>false,resolve,reject=()=>{}){
            this.addEventListener(type,(e)=>{
                if(cond(this,e)){
                    resolve(e);
                }
            })
        }
        
        onDelegate(type,selector,resolve,reject){
            return this.delegate(type,__delegate.bind(null,selector,false),resolve,reject)
        }
        //if u dom is visual but it is shadow 
        //use this :D
        onRoot(type,selector,resolve,reject){
            return this.delegate(type,__delegate.bind(null,selector,true),resolve,reject)
        }
        async one(type,selector){
            return new Promise((resolve,reject)=>{
                this.on(type,selector,resolve,reject);
            })
        }
        async oneDelegate(type,selector){
            return new Promise((resolve,reject)=>{
                this.onDelegate(type,selector,resolve,reject);
            })
        }
    }
};
export default VSElement();