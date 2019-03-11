function VSElement(superConstructor = HTMLElement){
    if(!(Object.getPrototypeOf(superConstructor) === HTMLElement || superConstructor === HTMLElement)){
        throw new Error("need extends HTMLElement");
    }
    return class __VSElement__ extends superConstructor{
        constructor(){
            super();
            this.isReady = false;
        }
        static extend(superConstructor){
            return VSElement(superConstructor);
        }
        attributeChangedCallback(){
            debugger;
        }
    }
};
export default VSElement();