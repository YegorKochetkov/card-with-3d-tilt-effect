// Cut from slider https://codepen.io/dev_loop/pen/MWKbJmO

// -------------------------------------------------
// ------------------ Utilities --------------------
// -------------------------------------------------

/**
 * Linear interpolation between two values:
 * Linear interpolation (lerp) is a mathematical technique
 * used to smoothly transition or blend between two values.
 *
 * Here's a detailed explanation:
 *
 * In the context of the lerp function (a, b, t) => a + (b - a) * t:
 *
 * a is the starting value
 * b is the ending value
 * t is the interpolation factor (typically between 0 and 1)
 *
 * Examples to illustrate:
 *
 * lerp(0, 100, 0.5) → 50 (exactly halfway between 0 and 100)
 * lerp(0, 100, 0.25) → 25 (25% of the way from 0 to 100)
 * lerp(0, 100, 0.75) → 75 (75% of the way from 0 to 100)
 *
 * In this project, lerp is used for smooth animations:
 *
 * Creating gradual transitions in tilt and background position
 * Providing a more natural, fluid motion instead of abrupt changes
 * Allowing fine-grained control over animation progression
 *
 * This creates a soft, eased movement that makes the tilt effect feel more organic
 * and visually appealing.
 *
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Generates unique incremental IDs
 * @returns {function(): string} ID generator function
 */
const genId = (() => {
	let count = 0;
	return () => (count++).toString();
})();

/**
 * Manages RequestAnimationFrame callbacks
 */
class Raf {
	constructor() {
		this.rafId = 0;
		this.raf = this.raf.bind(this);
		this.callbacks = [];

		this.start();
	}

	/**
	 * Starts the animation frame loop
	 */
	start() {
		this.raf();
	}

	/**
	 * Stops the animation frame loop
	 */
	stop() {
		cancelAnimationFrame(this.rafId);
	}

	/**
	 * Runs animation frame callbacks
	 */
	raf() {
		this.callbacks.forEach(({ callback, id }) => callback({ id }));
		this.rafId = requestAnimationFrame(this.raf);
	}

	/**
	 * Adds a callback to the animation frame loop
	 * @param {function} callback - Function to call on each frame
	 * @param {string} [id] - Optional unique identifier
	 */
	add(callback, id) {
		this.callbacks.push({ callback, id: id || genId() });
	}

	/**
	 * Removes a callback from the animation frame loop
	 * @param {string} id - Identifier of the callback to remove
	 */
	remove(id) {
		this.callbacks = this.callbacks.filter((callback) => callback.id !== id);
	}
}

/**
 * 2D Vector utility class
 */
class Vec2 {
	/**
	 * @param {number} [x=0] - X coordinate
	 * @param {number} [y=0] - Y coordinate
	 */
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Sets vector coordinates
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 */
	set(x, y) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Linear interpolation between current and target vector
	 * @param {Vec2} v - Target vector
	 * @param {number} t - Interpolation factor
	 */
	lerp(v, t) {
		this.x = lerp(this.x, v.x, t);
		this.y = lerp(this.y, v.y, t);
	}
}

/**
 * Creates a new Vec2 instance
 * @param {number} [x=0] - X coordinate
 * @param {number} [y=0] - Y coordinate
 * @returns {Vec2} New Vec2 instance
 */
const vec2 = (x = 0, y = 0) => new Vec2(x, y);

/**
 * Adds tilt effect to an element
 * @param {HTMLElement} node - Target element
 * @param {Object} [options] - Tilt effect options
 * @returns {Object} Destroy and update methods
 */
export function tilt(node, options) {
	let { trigger, target } = resolveOptions(node, options);

	let lerpAmount = 0.06;

	const rotDeg = { current: vec2(), target: vec2() };
	const bgPos = { current: vec2(), target: vec2() };

	/**
	 * Updates tilt effect options
	 * @param {Object} newOptions - New configuration options
	 */
	const update = (newOptions) => {
		destroy();
		({ trigger, target } = resolveOptions(node, newOptions));
		init();
	};

	let rafId;

	/**
	 * Animates tilt and background position
	 * @param {Object} param - Animation frame parameters
	 */
	function ticker({ id }) {
		rafId = id;

		rotDeg.current.lerp(rotDeg.target, lerpAmount);
		bgPos.current.lerp(bgPos.target, lerpAmount);

		for (const el of target) {
			el.style.setProperty("--rotX", rotDeg.current.y.toFixed(2) + "deg");
			el.style.setProperty("--rotY", rotDeg.current.x.toFixed(2) + "deg");

			el.style.setProperty("--bgPosX", bgPos.current.x.toFixed(2) + "%");
			el.style.setProperty("--bgPosY", bgPos.current.y.toFixed(2) + "%");
		}
	}

	/**
	 * Handles mouse move event for tilt effect
	 * @param {MouseEvent} param - Mouse event
	 */
	const onMouseMove = ({ offsetX, offsetY }) => {
		lerpAmount = 0.1;

		for (const el of target) {
			const ox = (offsetX - el.clientWidth * 0.5) / (Math.PI * 3);
			const oy = -(offsetY - el.clientHeight * 0.5) / (Math.PI * 4);

			rotDeg.target.set(ox, oy);
			bgPos.target.set(-ox * 0.3, oy * 0.3);
		}
	};

	/**
	 * Resets tilt effect when mouse leaves
	 */
	const onMouseLeave = () => {
		lerpAmount = 0.06;

		rotDeg.target.set(0, 0);
		bgPos.target.set(0, 0);
	};

	/**
	 * Adds event listeners for tilt effect
	 */
	const addListeners = () => {
		trigger.addEventListener("mousemove", onMouseMove);
		trigger.addEventListener("mouseleave", onMouseLeave);
	};

	/**
	 * Removes event listeners
	 */
	const removeListeners = () => {
		trigger.removeEventListener("mousemove", onMouseMove);
		trigger.removeEventListener("mouseleave", onMouseLeave);
	};

	/**
	 * Initializes tilt effect
	 */
	const init = () => {
		addListeners();
		raf.add(ticker);
	};

	/**
	 * Destroys tilt effect and removes listeners
	 */
	const destroy = () => {
		removeListeners();
		raf.remove(rafId);
	};

	init();

	return { destroy, update };
}

/**
 * Resolves tilt effect options with defaults
 * @param {HTMLElement} node - Target element
 * @param {Object} [options] - Configuration options
 * @returns {Object} Resolved trigger and target elements
 */
function resolveOptions(node, options) {
	return {
		trigger: options?.trigger ?? node,
		target: options?.target
			? Array.isArray(options.target)
				? options.target
				: [options.target]
			: [node],
	};
}

// -----------------------------------------------------

// Global Raf Instance
const raf = new Raf();

/**
 * Initializes tilt effect for all background wrappers
 */
function init() {
	const slides = [...document.querySelectorAll(".background-wrapper")];
	const slidesInfo = [...document.querySelectorAll(".card-info-wrapper")];

	slides.forEach((slide, i) => {
		const slideInner = slide.querySelector(".background-inner-wrapper");
		const slideInfoInner = slidesInfo[i].querySelector(
			".card-info-inner-wrapper"
		);

		tilt(slide, { target: [slideInner, slideInfoInner] });
	});
}

init();
