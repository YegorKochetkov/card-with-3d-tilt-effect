// Cut from slider https://codepen.io/dev_loop/pen/MWKbJmO
import React, { useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";

import { Button } from "./Button";
import { cn } from "../../lib/utils";

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
 */
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const lerpFactor = 0.06;

interface Vec2 {
	x: number;
	y: number;
}
/**
 * Creates a 2D Vector
 */
const createVec2 = (x = 0, y = 0) => {
	const state = { x, y };

	/**
	 * Sets vector coordinates
	 */
	const set = (newX: number, newY: number) => {
		state.x = newX;
		state.y = newY;
	};

	/**
	 * Linear interpolation between current and target vector
	 */
	const interpolateVec = (v: Vec2, t: number) => {
		state.x = lerp(state.x, v.x, t);
		state.y = lerp(state.y, v.y, t);
	};

	return {
		get x() {
			return state.x;
		},
		get y() {
			return state.y;
		},
		set,
		interpolate: interpolateVec,
	};
};

const rotation = {
	current: createVec2(),
	target: createVec2(),
};
const position = {
	current: createVec2(),
	target: createVec2(),
};

export const ParallaxCard = ({
	src,
	title,
	description,
	isComingSoon,
	decorativeElement,
}: {
	src?: string;
	title?: string | React.ReactNode;
	description?: string | React.ReactNode;
	decorativeElement?: string | React.ReactNode;
	isComingSoon?: boolean;
}) => {
	const cardRef = React.useRef<HTMLDivElement>(null);
	const backgroundWrapperRef = useRef<HTMLDivElement>(null);
	const textWrapperRef = React.useRef<HTMLDivElement>(null);

	const setStyle = (rotation: Vec2, position: Vec2) => {
		backgroundWrapperRef.current?.style.setProperty(
			"--rotX",
			rotation.y.toFixed(2) + "deg"
		);
		backgroundWrapperRef.current?.style.setProperty(
			"--rotY",
			rotation.x.toFixed(2) + "deg"
		);
		backgroundWrapperRef.current?.style.setProperty(
			"--bgPosX",
			position.x.toFixed(2) + "%"
		);
		backgroundWrapperRef.current?.style.setProperty(
			"--bgPosY",
			position.y.toFixed(2) + "%"
		);

		textWrapperRef.current?.style.setProperty(
			"--rotX",
			rotation.y.toFixed(2) + "deg"
		);
		textWrapperRef.current?.style.setProperty(
			"--rotY",
			rotation.x.toFixed(2) + "deg"
		);
		textWrapperRef.current?.style.setProperty(
			"--bgPosX",
			position.x.toFixed(2) + "%"
		);
		textWrapperRef.current?.style.setProperty(
			"--bgPosY",
			position.y.toFixed(2) + "%"
		);
	};

	const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!cardRef.current) return;

		cardRef.current?.classList.remove("reset-position");

		const { clientX, clientY } = event;
		const { left, top, width, height } = cardRef.current.getBoundingClientRect();

		const x = clientX - left;
		const y = clientY - top;

		const xPercentage = x / width;
		const yPercentage = y / height;

		const rotationXFactor = width < 700 ? 2 : 1;
		const rotationYFactor = height < 600 ? 4 : 2;

		const xRotation = (xPercentage - 0.5) * (Math.PI * rotationXFactor);
		const yRotation = -(yPercentage - 0.5) * (Math.PI * rotationYFactor);

		rotation.target.set(xRotation, yRotation);
		position.target.set(-xRotation * 0.6, yRotation * 0.6);

		rotation.current.interpolate(rotation.target, lerpFactor);
		position.current.interpolate(position.target, lerpFactor);

		setStyle(rotation.current, position.current);
	};

	const onMouseLeave = () => {
		cardRef.current?.classList.add("reset-position");

		rotation.current.set(0, 0);
		position.current.set(0, 0);

		setStyle(rotation.current, position.current);

		rotation.target.set(0, 0);
		position.target.set(0, 0);

		rotation.current.interpolate(rotation.target, lerpFactor);
		position.current.interpolate(position.target, lerpFactor);
	};

	return (
		<article
			className="parallax-card size-full hover:scale-[98%] hover:md:scale-[99%]"
			onMouseLeave={onMouseLeave}
			onMouseMove={onMouseMove}
			ref={cardRef}
		>
			{/* Card background */}
			<div className="background-wrapper">
				<div className="background-inner-wrapper" ref={backgroundWrapperRef}>
					<div className="video-wrapper rounded-lg overflow-hidden border border-white/20 bg-bbsu-violet-300">
						<video src={src} autoPlay muted loop className="video" />
					</div>
				</div>
			</div>

			{/* Card Info */}
			<div className="card-info-wrapper">
				<div className="card-info-inner-wrapper" ref={textWrapperRef}>
					<div className="card-info-text-wrapper">
						<div>
							<h2 className="card-info-title">
								<span>{title}</span>
							</h2>
							<p className="card-info-description">{description}</p>
						</div>
						{isComingSoon ? (
							<Button
								type="button"
								className={cn("button", "video-card-button")}
								rightIcon={<TiLocationArrow />}
							>
								Coming soon
							</Button>
						) : null}
					</div>
					{decorativeElement}
				</div>
			</div>
		</article>
	);
};
