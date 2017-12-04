# ng-cover-flow

![Alt text](cover-flow-beta.gif)

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

## API REFERENCE

| Name                   | Type    | Description                                                                   |Default|
|------------------------|---------|--------------------------------------------------------------------------------|-------|
| cover-flow-disabled   | @Input  | all coverflow scrolling events is disabled. | false |

___

# Todo
> - [x] auto move scrolling<br>
> - [x] responsive sizing

# License
 [MIT](/LICENSE)