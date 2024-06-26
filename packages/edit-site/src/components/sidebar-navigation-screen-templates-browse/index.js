/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import { unlock } from '../../lock-unlock';
import DataviewsTemplatesSidebarContent from './content';

const { useLocation } = unlock( routerPrivateApis );

export default function SidebarNavigationScreenTemplatesBrowse() {
	const {
		params: { activeView = 'all' },
	} = useLocation();

	return (
		<SidebarNavigationScreen
			title={ __( 'Manage templates' ) }
			description={ __(
				'Create new templates, or reset any customizations made to the templates supplied by your theme.'
			) }
			content={
				<DataviewsTemplatesSidebarContent
					activeView={ activeView }
					title={ __( 'All templates' ) }
				/>
			}
		/>
	);
}
