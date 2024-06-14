/** @jsx h */

export function h(type, props, ...children) {
	return {
		type,
		props,
		key: Math.floor(Math.random() * 1000),
		children: children.flat(),
	};
}

const createNode = node => {
	if (typeof node === 'string') {
		return document.createTextNode(node);
	}
	const $element = document.createElement(node.type);

	if (node.props) {
		Object.keys(node.props).forEach(prop => {
			if (prop.startsWith('on')) {
				const event = prop.toLowerCase().substring(2);
				$element.addEventListener(event, node.props[prop]);
			} else {
				$element[prop] = node.props[prop];
			}
		});
	}
	node.children.map(createNode).forEach(child => $element.appendChild(child));

	return $element;
};

const diff = ($app, newNode, oldNode, index = 0) => {
	const queue = [{ $parent: $app, newNode, oldNode, index }];

	while (queue.length > 0) {
		const { $parent, oldNode, newNode, index } = queue.shift();

		if (!oldNode && newNode) {
			$parent.appendChild(createNode(newNode));
			continue;
		}

		if (oldNode && !newNode) {
			$parent.removeChild($parent.childNodes[index]);
			continue;
		}

		if (typeof oldNode === 'string' && typeof newNode === 'string') {
			if (oldNode !== newNode) {
				$parent.replaceChild(createNode(newNode), $parent.childNodes[index]);
			}
			continue;
		}

		if (oldNode && newNode && oldNode.type !== newNode.type) {
			$parent.replaceChild(createNode(newNode), $parent.childNodes[index]);
			continue;
		}

		if (oldNode && newNode && oldNode.type === newNode.type) {
			const maxLength = Math.max(
				newNode.children.length,
				oldNode.children.length
			);
			for (let i = 0; i < maxLength; i++) {
				queue.push({
					$parent: $parent.childNodes[index],
					newNode: newNode.children[i],
					oldNode: oldNode.children[i],
					index: i,
				});
			}
		}
	}
};

const state = {
	todos: [
		{ id: 1, title: 'HTML', completed: false },
		{ id: 2, title: 'CSS', completed: true },
		{ id: 3, title: 'JavaScript', completed: false },
	],
};

const addHandler = () => {
	const value = document.querySelector('#inputs').value;
	state.todos.push({
		id: state.todos.length + 1,
		title: value,
		completed: false,
	});
	const newCurrent = render(state.todos);
	diff($app, newCurrent, current);
};

const render = array => {
	return (
		<div id='App'>
			<ul>
				{array.map(item => (
					<li>
						{item.title}
						<input type='checkbox' checked={item.completed} />
					</li>
				))}
			</ul>
			<div>
				<input type='text' id='inputs' onChange={e => e.target.value} />
				<button onClick={addHandler}>추가+</button>
				<button>삭제-</button>
			</div>
		</div>
	);
};

const $app = document.createElement('div');
document.body.appendChild($app);
const current = render(state.todos);
diff($app, current);
