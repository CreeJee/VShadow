import Store from "./store.js";
import VSEvent from "./event.js";
const $root = Store.root;
function VSElement(superConstructor = HTMLElement){
    if(!(Object.getPrototypeOf(superConstructor) === HTMLElement || superConstructor === HTMLElement)){
        throw new Error("need extends HTMLElement");
    }
    return class __VSElement__ extends superConstructor{
        constructor(){
            super();
            this.root = this.attachShadow({mode: 'open'});
            this.$store = new Store();
            this.isReady = false;
        }
        static extend(superConstructor){
            return VSElement(superConstructor);
        }
        static get template(){
            return Promise.reject(new Error(`need implements [${this.name}.template]`));
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
        onDelegate(type,selector,resolve,reject=()=>{}){
            this.addEventListener(type,(e)=>{
                if(Array.from(this.querySelectorAll(selector)).includes(e.target)){
                    resolve(e);
                }
            })
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