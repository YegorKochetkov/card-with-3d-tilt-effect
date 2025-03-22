// Cut from slider https://codepen.io/dev_loop/pen/MWKbJmO
import React, { useRef, useEffect } from "react";

// Linear interpolation (lerp) is a mathematical technique
// used to smoothly transition or blend between two values.
const lerp = (a, b, t) => a + (b - a) * t;

const useTiltEffect = (options = {}) => {
	const nodeRef = useRef(null);
	const stateRef = useRef({
		tilt: { x: 0, y: 0 },
		transformStyle: {},
		rafId: null,
	});

	useEffect(() => {
		const node = nodeRef.current;
		if (!node) return;

		const defaultOptions = {
			"max": 15,
			"perspective": 1000,
			"scale": 1.05,
			"speed": 300,
			"easing": "cubic-bezier(0.03, 0.98, 0.52, 0.99)",
			"glare": false,
			"max-glare": 0.3,
			"glare-prerender": false,
			"gyroscope": true,
		};

		const mergedOptions = { ...defaultOptions, ...options };

		const handleMouseMove = (event) => {
			const rect = node.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const mouseX = event.clientX - centerX;
			const mouseY = event.clientY - centerY;

			const tiltX = lerp(
				stateRef.current.tilt.x,
				-(mouseY / rect.height) * mergedOptions.max,
				0.1
			);
			const tiltY = lerp(
				stateRef.current.tilt.y,
				(mouseX / rect.width) * mergedOptions.max,
				0.1
			);

			stateRef.current.tilt = { x: tiltX, y: tiltY };

			const transformStyle = {
				transform:
					`perspective(${mergedOptions.perspective}px) ` +
					`rotateX(${tiltX}deg) ` +
					`rotateY(${tiltY}deg) ` +
					`scale3d(${mergedOptions.scale}, ${mergedOptions.scale}, ${mergedOptions.scale})`,
				transition: `transform ${mergedOptions.speed}ms ${mergedOptions.easing}`,
			};

			node.style.transform = transformStyle.transform;
			node.style.transition = transformStyle.transition;
		};

		const handleMouseLeave = () => {
			node.style.transform =
				"perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
			node.style.transition = `transform ${mergedOptions.speed}ms ${mergedOptions.easing}`;
		};

		const mouseMoveController = new AbortController();
		node.addEventListener("mousemove", handleMouseMove, {
			signal: mouseMoveController.signal,
		});
		node.addEventListener("mouseleave", handleMouseLeave, {
			signal: mouseMoveController.signal,
		});

		return () => {
			mouseMoveController.abort();
		};
	}, [options]);

	return nodeRef;
};

const ParallaxCard = () => {
	const cardRef = useTiltEffect();

	return (
		<div
			ref={cardRef}
			className="card relative w-[min(25vw,300px)] aspect-[2/3] overflow-hidden transform-gpu will-change-transform"
		>
			{/* Card background */}
			<div className="background-wrapper absolute w-full h-full pointer-events-auto">
				<div className="background-inner-wrapper w-full h-full">
					<div className="image-wrapper w-full h-full">
						<img
							className="image w-full h-full object-cover"
							src="https://devloop01.github.io/voyage-slider/images/scotland-mountains.jpg"
							alt="Scotland Mountains"
						/>
					</div>
				</div>
			</div>

			{/* Card Info */}
			<div className="card-info-wrapper absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
				<div className="card-info-inner-wrapper text-white">
					<div className="card-info-text-wrapper space-y-2">
						<div className="card-info-text text-3xl font-bold">
							<span>Highlands</span>
						</div>
						<div className="card-info-text text-xl">
							<span>Scotland</span>
						</div>
						<div className="card-info-text text-sm opacity-80">
							<span>The mountains are calling</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ParallaxCard;
