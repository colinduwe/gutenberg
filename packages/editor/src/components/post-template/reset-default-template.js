/**
 * WordPress dependencies
 */
import { MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import {
	useAllowSwitchingTemplates,
	useCurrentTemplateSlug,
	useEditedPostContext,
} from './hooks';
import { store as editorStore } from '../../store';

export default function ResetDefaultTemplate( { onClick } ) {
	const currentTemplateSlug = useCurrentTemplateSlug();
	const allowSwitchingTemplate = useAllowSwitchingTemplates();
	const { postType, postId } = useEditedPostContext();
	const { editEntityRecord } = useDispatch( coreStore );
	const bodyClasses = useSelect( ( select ) => {
			const { getEditorSettings } = select( editorStore );
			const editorSettings = getEditorSettings();
			return editorSettings.bodyClasses;
		 }, [] );
	const { updateEditorSettings } = useDispatch( editorStore );
	// The default template in a post is indicated by an empty string.
	if ( ! currentTemplateSlug || ! allowSwitchingTemplate ) {
		return null;
	}
	return (
		<MenuItem
			onClick={ () => {
				editEntityRecord(
					'postType',
					postType,
					postId,
					{ template: '' },
					{ undoIgnore: true }
				);
				let hasPageTemplateClass = false;
				const updatedBodyClasses = bodyClasses.map( className => {
					if ( className.startsWith( 'page-template-' )) {
						hasPageTemplateClass = true;
						return `page-template-default`;
					}
					return className;
				});
				if ( ! hasPageTemplateClass ) {
					updatedBodyClasses.push( `page-template-default` );
				}
				updateEditorSettings( { bodyClasses: updatedBodyClasses } );
				onClick();
			} }
		>
			{ __( 'Use default template' ) }
		</MenuItem>
	);
}
