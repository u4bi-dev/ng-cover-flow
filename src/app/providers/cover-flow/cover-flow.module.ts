import {
    /* DoCheck, */
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

export class CoverFlow implements OnDestroy, OnInit, OnChanges /* DoCheck */ {

    private _disabled: boolean;
    private isPressed : boolean;
    private targetFlowTime : number;
    private targetOffset : number;
    private targetCenter : number;
    private targetAmplitude : number;
    private targetVelocity : number;
    private targetReference : number;
    private targetTimestamp : number;
    private targetFrame : number;
    private targetTapTicker : any;
    
    private elNodes: Array<Element> = [];
    private elWidth: string;
    private elHeight: string;
    private elNodeLength : number;
    private elForm: string;
    private elOffset : number;
    private elAngle : number;
    private elNodeDistance : number;
    private elSideNodeMargin : number;
    private elCenterNodeMargin : number;

    @Input('cover-flow-disabled')
    get disabled() { return this._disabled; }
    set disabled(value: boolean) { this._disabled = value; };

    onMouseMoveHandler = this.onMouseMove.bind(this);
    onMouseDownHandler = this.onMouseDown.bind(this);
    onMouseUpHandler = this.onMouseUp.bind(this);
  
    mouseMoveListener: Function;
    mouseDownListener: Function;
    mouseUpListener: Function;

    constructor( private el : ElementRef, private renderer : Renderer2){ }

    public attach( { disabled } : CoverFlowOption){
        console.log('attach');

        this._disabled = disabled;
        this.ngOnChanges();
    }
    @HostListener('window:resize', ['$event'])
    onResize(e) : void {
        this.scroll(e);
    }
    ngOnChanges() : void {}
    ngOnInit() : void {
        this.markElDimension();
        this.initialize();
        this.setupEvents();

        this.renderer.setAttribute(this.el.nativeElement, 'cover-flow', 'true');
    }    
    private markElDimension() : void {
        this.elWidth = window.getComputedStyle(this.el.nativeElement).width;
        this.elHeight = window.getComputedStyle(this.el.nativeElement).height;
        this.elNodeLength = this.el.nativeElement.children.length;

        this.el.nativeElement.style.perspective = '500px';
        this.el.nativeElement.style.transformStyle = 'preserve-3d';
        Array.from(this.el.nativeElement.children).map((el : HTMLDivElement, index : number) => {
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.opacity = '0';
            el.style.width = this.elHeight;
            el.style.height = this.elHeight;
        });
        this.elNodes = this.el.nativeElement.children || [];

    }
    private stylePrefix(){
        this.elForm = 'transform';

        ['webkit', 'Moz', 'O', 'ms'].every( (prefix) => {
            let e = prefix + 'Transform';
            if (typeof document.body.style[e] !== 'undefined') {
                this.elForm = e;
                return false;
            }
            return true;
        });
    }
    private initialize() : void {
        this.stylePrefix();
        this.elSideNodeMargin = parseInt(this.elHeight.split('px')[0]);
        this.elCenterNodeMargin = 10;
        this.elNodeDistance = -150;
        this.elAngle = -60;
        this.targetOffset = this.elOffset = 0;
        this.targetFlowTime = 950;

        this.isPressed = false;
        
        this.scroll(this.elOffset);
    }
    private setupEvents(){   
        this.mouseDownListener = this.renderer.listen(this.el.nativeElement, 'mousedown', this.onMouseDownHandler);
        this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.onMouseMoveHandler);
        this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.onMouseUpHandler);
    }
    private xpos(e) {
        // mouse event
        return e.clientX;
    }
    private wrap(x) {
        return (x >= this.elNodeLength) ? (x % this.elNodeLength) : (x < 0) ? this.wrap(this.elNodeLength + (x % this.elNodeLength)) : x;
    }
    private scroll(x) {
        let i, half, delta, dir, tween, el, alignment;
        this.elOffset = (typeof x === 'number') ? x : this.elOffset;
        this.targetCenter = Math.floor((this.elOffset + this.elSideNodeMargin / 2) / this.elSideNodeMargin);
        delta = this.elOffset - this.targetCenter * this.elSideNodeMargin;
        dir = (delta < 0) ? 1 : -1;
        tween = -dir * delta * 2 / this.elSideNodeMargin;

        alignment = 'translateX(' + (innerWidth - this.elSideNodeMargin) / 2 + 'px) ';
        // alignment += 'translateY(' + (innerHeight - this.elSideNodeMargin) / 2 + 'px)';

        // center
        el = this.elNodes[this.wrap(this.targetCenter)];
        el.style[this.elForm] = alignment +
            ' translateX(' + (-delta / 2) + 'px)' +
            ' translateX(' + (dir * this.elCenterNodeMargin * tween) + 'px)' +
            ' translateZ(' + (this.elNodeDistance * tween) + 'px)' +
            ' rotateY(' + (dir * this.elAngle * tween) + 'deg)';
        el.style.zIndex = 0;
        el.style.opacity = 1;

        half = this.elNodeLength >> 1;
        for (i = 1; i <= half; ++i) {
            // right side
            el = this.elNodes[this.wrap(this.targetCenter + i)];
            el.style[this.elForm] = alignment +
                ' translateX(' + (this.elCenterNodeMargin + (this.elSideNodeMargin * i - delta) / 2) + 'px)' +
                ' translateZ(' + this.elNodeDistance + 'px)' +
                ' rotateY(' + this.elAngle + 'deg)';
            el.style.zIndex = -i;
            el.style.opacity = (i === half && delta < 0) ? 1 - tween : 1;

            // left side
            el = this.elNodes[this.wrap(this.targetCenter - i)];
            el.style[this.elForm] = alignment +
                ' translateX(' + (-this.elCenterNodeMargin + (-this.elSideNodeMargin * i - delta) / 2) + 'px)' +
                ' translateZ(' + this.elNodeDistance + 'px)' +
                ' rotateY(' + -this.elAngle + 'deg)';
            el.style.zIndex = -i;
            el.style.opacity = (i === half && delta > 0) ? 1 - tween : 1;
        }

        // center
        el = this.elNodes[this.wrap(this.targetCenter)];
        el.style[this.elForm] = alignment +
            ' translateX(' + (-delta / 2) + 'px)' +
            ' translateX(' + (dir * this.elCenterNodeMargin * tween) + 'px)' +
            ' translateZ(' + (this.elNodeDistance * tween) + 'px)' +
            ' rotateY(' + (dir * this.elAngle * tween) + 'deg)';
        el.style.zIndex = 0;
        el.style.opacity = 1;
        
    }
    private autoScroll() {
        let self = this;

        (function autoScroll(){
            var elapsed, delta;
            
            if (self.targetAmplitude) {
                elapsed = Date.now() - self.targetTimestamp;
                delta = self.targetAmplitude * Math.exp(-elapsed / self.targetFlowTime);

                if (delta > 4 || delta < -4) {
                    self.scroll(self.targetOffset - delta);
                    requestAnimationFrame(autoScroll);
                } else {
                    self.scroll(self.targetOffset);
                }
            }

        }());
    }
    private tap(e) {
        this.isPressed = true;
        this.targetReference = this.xpos(e);

        this.targetVelocity = 0;
        this.targetAmplitude = 0;
        this.targetFrame = this.elOffset;
        this.targetTimestamp = Date.now();
        clearInterval(this.targetTapTicker);
        this.targetTapTicker = setInterval(()=> {

            let now, elapsed, delta, v;
            
            now = Date.now();
            elapsed = now - this.targetTimestamp;
            this.targetTimestamp = now;
            delta = this.elOffset - this.targetFrame;
            this.targetFrame = this.elOffset;

            v = 1000 * delta / (1 + elapsed);
            this.targetVelocity = 0.8 * v + 0.2 * this.targetVelocity;

        }, 100);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    private drag(e) {
        var x, delta;
        if (this.isPressed) {
            x = this.xpos(e);
            delta = this.targetReference - x;
            if (delta > 2 || delta < -2) {
                this.targetReference = x;
                this.scroll(this.elOffset + delta);
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    private release(e) {
        this.isPressed = false;

        clearInterval(this.targetTapTicker);
        this.targetOffset = this.elOffset;

        if (this.targetVelocity > 10 || this.targetVelocity < -10) {
            this.targetAmplitude = 0.9 * this.targetVelocity;
            this.targetOffset = this.elOffset + this.targetAmplitude;
        }
        this.targetOffset = Math.round(this.targetOffset / this.elSideNodeMargin) * this.elSideNodeMargin;
        this.targetAmplitude = this.targetOffset - this.elOffset;
        this.targetTimestamp = Date.now();
        this.autoScroll();

        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // ngDoCheck() : void {

    // }
    ngOnDestroy() : void {
        this.renderer.setAttribute(this.el.nativeElement, 'cover-flow', 'false');
        this.mouseMoveListener();
        this.mouseUpListener();
    }

    onMouseMove(e: MouseEvent) : void {
        if (this.isPressed && !this.disabled) {
            e.preventDefault();
            
            this.drag(e);
        }
    }
    onMouseDown(e: MouseEvent) : void {
        this.tap(e);
    }
    onMouseUp(e: MouseEvent) : void {
        e.preventDefault();

        if (this.isPressed) {            
            this.release(e);
        }
    }

}

@NgModule({
  exports      : [CoverFlow],
  declarations : [CoverFlow]
})
export class CoverFlowModule { }
