import { DotPager } from '@automattic/jetpack-components';
import { __ } from '@wordpress/i18n';
import preventWidows from '../../utils/prevent-widows';
import { Slide01Content } from './slide-01-content';
import { Slide01Gradient } from './slide-01-gradient';
import type { FC } from 'react';

import './style.scss';

const Testimonials: FC = () => {
	return (
		<>
			<DotPager rotateTime={ 5 } className="jetpack-onboarding-testimonials-pager">
				<div className="jetpack-onboarding-testimonial jetpack-onboarding-testimonial--1">
					<Slide01Gradient />
					<div className="jetpack-onboarding-testimonial__content">
						<div className="jetpack-onboarding-testimonial__messages">
							<Slide01Content />
						</div>
					</div>
				</div>
				<div className="jetpack-onboarding-testimonial jetpack-onboarding-testimonial--2">
					<div className="jetpack-onboarding-testimonial__content">
						<p className="jetpack-onboarding-testimonial__quote">
							{ preventWidows(
								__(
									"Jetpack's performance features are no-brainers for the sites I build. With one-click CDN, there's no need to sacrifice performance for style. I know that it just automagically works once I toggle that button.",
									'jetpack-my-jetpack'
								)
							) }
						</p>
						<p className="jetpack-onboarding-testimonial__author">
							<strong>{ __( 'Sasha Endoh', 'jetpack-my-jetpack' ) }</strong>
						</p>
						<p className="jetpack-onboarding-testimonial__title">
							{ __( 'Multidisciplinary Designer', 'jetpack-my-jetpack' ) }
						</p>
					</div>
				</div>
				<div className="jetpack-onboarding-testimonial jetpack-onboarding-testimonial--3">
					<div className="jetpack-onboarding-testimonial__content">
						<p className="jetpack-onboarding-testimonial__quote">
							{ preventWidows(
								__(
									"Millions of people depend on my site, and downtime isn't an option. Jetpack handles my site security and backups so I can focus on creation.",
									'jetpack-my-jetpack'
								)
							) }
						</p>
						<p className="jetpack-onboarding-testimonial__author">
							<strong>{ __( 'Tim Ferriss', 'jetpack-my-jetpack' ) }</strong>
						</p>
						<p className="jetpack-onboarding-testimonial__title">
							{ __( 'Author, Investor, Podcaster', 'jetpack-my-jetpack' ) }
						</p>
					</div>
				</div>
			</DotPager>
		</>
	);
};

export default Testimonials;
