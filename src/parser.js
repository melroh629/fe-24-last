function tokenize(str) {
	const tokens = [];
	const regex = /(<\/?[\w\s="/.':;#-\/\?]+>)|([^<>]+)/g;
	let match;
	while ((match = regex.exec(str)) !== null) {
		if (match[0].trim() !== '') {
			tokens.push(match[0]);
		}
	}
	return tokens;
}

function parse(tokens) {
	const root = { type: 'root', props: {}, children: [] };
	const stack = [root];

	tokens.forEach(token => {
		if (token.startsWith('</')) {
			stack.pop();
		} else if (token.startsWith('<')) {
			const element = createElement(token);
			stack[stack.length - 1].children.push(element);
			if (!element.selfClosing) {
				stack.push(element);
			}
		} else {
			stack[stack.length - 1].children.push({
				type: 'text',
				props: { nodeValue: token },
				children: [],
			});
		}
	});

	return root;
}

function createElement(token) {
	const isSelfClosing = /\/>$/.test(token);
	const tagMatch = token.match(/<\/?([a-zA-Z0-9]+)/);
	const type = tagMatch ? tagMatch[1] : null;

	const props = {};
	token.replace(/([a-zA-Z-]+)="([^"]*)"/g, (_, key, value) => {
		props[key] = value;
	});

	return {
		type,
		props,
		children: [],
		selfClosing: isSelfClosing,
	};
}

//render
function createElementFromVirtual(node) {
	if (node.type === 'text') {
		return document.createTextNode(node.props.nodeValue);
	}

	const $el = document.createElement(node.type);
	Object.entries(node.props || {}).forEach(([name, value]) => {
		if (name.startsWith('on')) {
			const event = name.slice(2).toLowerCase();
			$el.addEventListener(event, new Function(value));
		} else {
			$el.setAttribute(name, value);
		}
	});

	node.children.forEach(child => {
		$el.appendChild(createElementFromVirtual(child));
	});

	return $el;
}
