# ng-cover-flow

![Alt text](https://drive.google.com/uc?export=view&id=0B3XkfYbZArSfa3NodXo4OWhfcms)

# Install
```shell

```

# Setup

import the `CoverFlowModule` module.

```ts
import { CoverFlowModule } from 'ng-cover-flow';
...

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoverFlowModule,
    ...
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {
}
```
Add the cover-flow attribute element.
```ts
@Component({
  selector: 'sample',
  template:`
  <div cover-flow>
    <div></div>
    <div></div>
    ...
  </div>
  `
})
class Sample {}
```
That's it!

# Todo
> - [x] auto move scrolling<br>
> - [x] responsive sizing

# License
 [MIT](/LICENSE)