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

    /* cover */
    _count;
    _children;
    _dim;
    _offset;
    _center;
    _angle;
    _dist;
    _shift;
    _pressed;
    _reference;
    _amplitude;
    _target;
    _velocity;
    _timeConstant;
    _xform;
    _frame;
    _timestamp;
    _ticker;
    /* -----  */

    displayType : string;
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
    ){ }

    public attach( { disabled } : CoverFlowOption){
        console.log('attach');

        this._disabled = disabled;
        this.ngOnChanges();
    }
    @HostListener('window:resize', ['$event'])
    onResize(e) : void {
        this.scroll(e);
    }
    ngOnChanges() : void {

    }
    ngOnInit() : void {
        this.displayType = window.getComputedStyle(this.el.nativeElement).display;
        this.initialize();
        this.markElDimension();
        this.setupEvents();

        this.renderer.setAttribute(this.el.nativeElement, 'cover-flow', 'true');
    }
    private initialize() : void {
        this._xform = 'webkitTransform';

        // window.onresize = scroll;
        this._pressed = false;
        this.displayType = 'block';

        this._pressed = false;
        this._timeConstant = 950;
        this._dim = 200;
        this._offset = this._target = 0;
        this._angle = -60;
        this._dist = -150;
        this._shift = 10;
        this._count = 9;
        this._children = [];
        
        this.el.nativeElement.style.display = this.displayType;
        this.el.nativeElement.style.perspective = '500px';
        this.el.nativeElement.style.transformStyle = 'preserve-3d';

        this.childrenElements = this.el.nativeElement.children || [];
        Array.from(this.el.nativeElement.children).map((el : HTMLDivElement, index : number) => {
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.opacity = '0';
            el.style.width = '200px';
            el.style.height = '200px';
            this._children.push(el);

        });
        
        this.scroll(this._offset);
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
        return (x >= this._count) ? (x % this._count) : (x < 0) ? this.wrap(this._count + (x % this._count)) : x;
    }
    private scroll(x) {
        let i, half, delta, dir, tween, el, alignment;
        this._offset = (typeof x === 'number') ? x : this._offset;
        this._center = Math.floor((this._offset + this._dim / 2) / this._dim);
        delta = this._offset - this._center * this._dim;
        dir = (delta < 0) ? 1 : -1;
        tween = -dir * delta * 2 / this._dim;

        alignment = 'translateX(' + (innerWidth - this._dim) / 2 + 'px) ';
        // alignment += 'translateY(' + (innerHeight - this._dim) / 2 + 'px)';

        // center
        el = this._children[this.wrap(this._center)];
        el.style[this._xform] = alignment +
            ' translateX(' + (-delta / 2) + 'px)' +
            ' translateX(' + (dir * this._shift * tween) + 'px)' +
            ' translateZ(' + (this._dist * tween) + 'px)' +
            ' rotateY(' + (dir * this._angle * tween) + 'deg)';
        el.style.zIndex = 0;
        el.style.opacity = 1;

        half = this._count >> 1;
        for (i = 1; i <= half; ++i) {
            // right side
            el = this._children[this.wrap(this._center + i)];
            el.style[this._xform] = alignment +
                ' translateX(' + (this._shift + (this._dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + this._dist + 'px)' +
                ' rotateY(' + this._angle + 'deg)';
            el.style.zIndex = -i;
            el.style.opacity = (i === half && delta < 0) ? 1 - tween : 1;

            // left side
            el = this._children[this.wrap(this._center - i)];
            el.style[this._xform] = alignment +
                ' translateX(' + (-this._shift + (-this._dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + this._dist + 'px)' +
                ' rotateY(' + -this._angle + 'deg)';
            el.style.zIndex = -i;
            el.style.opacity = (i === half && delta > 0) ? 1 - tween : 1;
        }

        // center
        el = this._children[this.wrap(this._center)];
        el.style[this._xform] = alignment +
            ' translateX(' + (-delta / 2) + 'px)' +
            ' translateX(' + (dir * this._shift * tween) + 'px)' +
            ' translateZ(' + (this._dist * tween) + 'px)' +
            ' rotateY(' + (dir * this._angle * tween) + 'deg)';
        el.style.zIndex = 0;
        el.style.opacity = 1;
        
    }
    private autoScroll() {
        let self = this;

        (function autoScroll(){
            var elapsed, delta;
            
            if (self._amplitude) {
                elapsed = Date.now() - self._timestamp;
                delta = self._amplitude * Math.exp(-elapsed / self._timeConstant);

                if (delta > 4 || delta < -4) {
                    self.scroll(self._target - delta);
                    requestAnimationFrame(autoScroll);
                } else {
                    self.scroll(self._target);
                }
            }

        }());
    }
    private tap(e) {
        this._pressed = true;
        this._reference = this.xpos(e);

        this._velocity = 0;
        this._amplitude = 0;
        console.log(this._amplitude);
        this._frame = this._offset;
        this._timestamp = Date.now();
        clearInterval(this._ticker);
        this._ticker = setInterval(()=> {

            let now, elapsed, delta, v;
            
            now = Date.now();
            elapsed = now - this._timestamp;
            this._timestamp = now;
            delta = this._offset - this._frame;
            this._frame = this._offset;

            v = 1000 * delta / (1 + elapsed);
            this._velocity = 0.8 * v + 0.2 * this._velocity;

        }, 100);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    private drag(e) {
        var x, delta;
        if (this._pressed) {
            x = this.xpos(e);
            delta = this._reference - x;
            if (delta > 2 || delta < -2) {
                this._reference = x;
                this.scroll(this._offset + delta);
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    private release(e) {
        this._pressed = false;

        clearInterval(this._ticker);
        this._target = this._offset;

        if (this._velocity > 10 || this._velocity < -10) {
            this._amplitude = 0.9 * this._velocity;
            this._target = this._offset + this._amplitude;
        }
        this._target = Math.round(this._target / this._dim) * this._dim;
        this._amplitude = this._target - this._offset;
        this._timestamp = Date.now();
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
        if (this._pressed && !this.disabled) {
            e.preventDefault();
            
            this.drag(e);
        }
    }
    onMouseDown(e: MouseEvent) : void {
        this.tap(e);
    }
    onMouseUp(e: MouseEvent) : void {
        e.preventDefault();

        if (this._pressed) {            
            this.release(e);
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
