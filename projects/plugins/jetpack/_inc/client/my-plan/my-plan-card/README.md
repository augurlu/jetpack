My Plan Card
=======

My Plan Card is a React component for rendering a box with plan or product name, description and icon, its expiry
date and a button to manage the payment.

It's meant to be used on My Plan page to display plans and products that the user purchased.

See p1HpG7-7ET-p2 for more details.

### How to use the `<MyPlanCard />`

```jsx
import { Component } from 'react';
import MyPlanCard from 'components/my-plan-card';
import Button from 'components/button';

export default class extends Component {
	render() {
		return (
			<MyPlanCard
				action={ <Button compact>Manage Payment</Button> }
				details="Expires on October 27, 2020"
				icon="images/plans/plan-personal.svg"
				tagLine="Your data is being securely backed up and you have access to priority support."
				title="Jetpack Personal"
			/>
		);
	}
}
```

### `<MyPlanCard />` props

The following props can be passed to the My Plan Card component:

* `action`: ( element | node ) Action button element or node.
* `isError`: ( bool ) With this flag being set the details string is in an error state (red copy).
* `isPlaceholder`: ( bool ) Flag indicating that the component in is a loading state
* `details`: ( string ) Details about a plan or product, e.g. expiration or auto-renew date like `Expires on October 27, 2020`
* `icon`: ( string ) Plan or product icon path
* `tagLine`: ( string | element | node ) Plan or product tag line. It can be a string, a node or a React element (e.g. `<Fragment>`)
* `title`: ( string | element | node ) Plan or product title. It can be a string, a node or a React element (e.g. `<Fragment>`)
