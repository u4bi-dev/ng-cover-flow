import {
    DoCheck,
    NgModule,
    Directive,
    ElementRef,
    Renderer2,
    OnDestroy,
    Input,
    Output,
    OnInit,
    OnChanges,
    EventEmitter,
    HostListener
} from '@angular/core';
import { CoverFlowOption } from './interface/cover-flow-option';

@Directive({
    selector: '[cover-flow]'
})

export class CoverFlow implements OnDestroy, OnInit, OnChanges, DoCheck {

    private _disabled: boolean;

    displayType : string;

    isPressed : boolean;

    wrapper : HTMLDivElement;
    
    elWidth: string;
    elHeight: string;

    childrenElements: Array<Element> = [];

    @Input('cover-flow-disabled')
    get disabled() { return this._disabled; }
    set disabled(value: boolean) { this._disabled = value; };

    onMouseMoveHandler = this.onMouseMove.bind(this);
    onMouseDownHandler = this.onMouseDown.bind(this);
    onMouseUpHandler = this.onMouseUp.bind(this);
  
    mouseMoveListener: Function;
    mouseDownListener: Function;
    mouseUpListener: Function;

    constructor(
        private el       : ElementRef,
        private renderer : Renderer2
    ){
        console.log('cover flow constructor');

        this.isPressed = false;
        this.displayType = 'block';
        
        this.mouseDownListener = renderer.listen(el.nativeElement, 'mousedown', this.onMouseDownHandler);
        this.mouseMoveListener = renderer.listen('document', 'mousemove', this.onMouseMoveHandler);
        this.mouseUpListener = renderer.listen('document', 'mouseup', this.onMouseUpHandler);

    }

    public attach( { disabled } : CoverFlowOption){
        console.log('attach');

        this._disabled = disabled;
        this.ngOnChanges();
    }

    ngOnChanges() : void {
        console.log('ng on changes callback');

    }
    ngOnInit() : void {
        this.displayType = window.getComputedStyle(this.el.nativeElement).display;
        this.el.nativeElement.style.display = this.displayType;
        
        this.markElDimension();

        this.renderer.setAttribute(this.el.nativeElement, 'cover-flow', 'true');
    }
    ngDoCheck() : void {
        this.childrenElements = this.el.nativeElement.children || [];
    }
    ngOnDestroy() : void {
        this.renderer.setAttribute(this.el.nativeElement, 'cover-flow', 'false');
        this.mouseMoveListener();
        this.mouseUpListener();
    }

    onMouseMove(e: MouseEvent) : void {
        if (this.isPressed && !this.disabled) {
            e.preventDefault();
            
            console.log('on mouse move');
        }
    }
    onMouseDown(e: MouseEvent) : void {
        console.log('on mouse down');
        this.isPressed = true;
    }
    onMouseUp(e: MouseEvent) : void {
        e.preventDefault();

        if (this.isPressed) {
            this.isPressed = false;
            console.log('on mouse up');
        }
    }
    
    private markElDimension() : void {
        if (this.wrapper) {
            this.elWidth = this.wrapper.style.width;
            this.elHeight = this.wrapper.style.height;
        } else {
            this.elWidth = this.el.nativeElement.style.width;
            this.elHeight = this.el.nativeElement.style.height;
        }
    }
    
}

@NgModule({
  exports      : [CoverFlow],
  declarations : [CoverFlow]
})
export class CoverFlowModule { }
