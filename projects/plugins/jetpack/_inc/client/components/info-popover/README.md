InfoPopover
===========

`InfoPopover` is a component based on `Popover` used to show a popover as a tooltip to a `Gridicon`.

### `InfoPopover` Properties

#### `position`

The `position` property can be one of the following values:

- `top`
- `top left`
- `top right`
- `bottom`
- `bottom left`
- `bottom right`
- `left`
- `right`

#### `className`

The `className` lets you specify the style class that the element should have.

#### `gaEventCategory`

The `gaEventCategory` lets you specify the Google Analyics Category that you want the toggle event to have.
Also reqires the `popoverName` attribute.

#### `popoverName`

The `popoverName` lets you specify the Google Analyics Event name that you want the toggle event to have.
Also reqires the `gaEventCategory` attribute.

Turns into this even when opened:
analytics.ga.recordEvent( gaEventCategory, 'InfoPopover: ' + popoverName + 'Opened' );

#### `ignoreContext`

The `ignoreContext` lets you specify a component that you want to be on the inside clickOutside context.
So a context that you want to ignore. In most cases this is not needed but if you want to also have a label
that can trigger the opening and closing of the InfoPopover then you need to pass in the label component as a reference.

#### `screenReaderText`

This optional property admits a string that will be wrapped in a span.screen-reader-text and used for accessibility.

### Basic `InfoPopover` Usage

```js
<InfoPopover position="bottom left">
    This is some informational text
</InfoPopover>
```


```js

infoPopRef = createRef();
moreInfoLabelRef = createRef();

handleAction( event ) {
	this.infoPopRef.current._onClick( event );
},

render() {
	return (
		<div>
			<label onClick={ this.handleAction } ref={ this.moreInfoLabelRef }>More Info</label>
			<InfoPopover
				position="bottom left"
				ref={ this.infoPopRef }
				className="more-info"
				gaEventCategory="Reader"
				popoverName="More info in the reader"
				ignoreContext={ this.moreInfoLabelRef.current }
				screenReaderText="Learn more" >
				This is some informational text
			</InfoPopover>
		</div>
	)
}

```
