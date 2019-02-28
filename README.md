# VShadow
> webcomponents light library

## VShadow
- get BaseComponent 
    - when based Component class (extends HtmlElement)
    - get \[VShadow.tagNameSymbol\]
        - defined tagName (required)
    - get \[VShadow.extendsSymbol\]
        - defined extendsTagName (optional)
    - get template
        - for paresed tag template (using async)
    - onRegister()
        -when registerd tag called
- defind({OriginalClass extends HtmlElement}) return (VShadow.BaseComponent extends OriginalClass)
- async load({...path extends Array<String>}) return Promise\[\]<VShadow.BaseComponent extends HtmlELements>
### how to use
```javascript
    
```

## FixedType
>> it contains side effect
- property(obj extends Object,key extedns String,type extends Class) return obj
- expect(functor extends Function,type extends Class) return functor
- get BaseType 
    - get base type
- get Spread
    - get Spread type argument struct
- get Instance
    - use(...baseTypes extends FixedType.BaseType) : FixedType.Instance
    - \_\_useProps\_\_
        - get used type condition data
    - __get 
        - check argument type is sucess
    - __callMiddleWare(parent extends Map<String,Map<...>>)
        - call \_\_useProps\_\_ called
    
### how to use


##TODO 
- template 태그를 이용한 캐싱,
- _루프밑 cond관련처리는 강타입으로 추가_
    - cond
    - iterate
    - filter
    - one
    - each
    - ...등등 추가예정
- i18n package
- middleware binder 구조및 Promise<null> 꼴의 대이터처리
- dom attribute mapping & observable
- state manager + 각 컴포넛트 별로 State + event Trigger,delegate처리 이벤트 전파구현
    - 가벼운 store 개념 추가
        - event dispatch 관련 store전파 추가
        - store에서 직접 call 추가


