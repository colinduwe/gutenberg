/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __experimentalBlockPatternsList as BlockPatternsList } from '@wordpress/block-editor';
import { MenuItem, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { parse } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { useAvailableTemplates, useEditedPostContext } from './hooks';
import { store as editorStore } from '../../store';

export default function SwapTemplateButton( { onClick } ) {
	const [ showModal, setShowModal ] = useState( false );
	const { postType, postId } = useEditedPostContext();
	const availableTemplates = useAvailableTemplates( postType );
	const { editEntityRecord } = useDispatch( coreStore );
	const bodyClasses = useSelect( ( select ) => {
		const { getEditorSettings } = select( editorStore );
		const editorSettings = getEditorSettings();
		return editorSettings.bodyClasses;
	 }, [] );
	const { updateEditorSettings } = useDispatch( editorStore );
	if ( ! availableTemplates?.length ) {
		return null;
	}
	const onTemplateSelect = async ( template ) => {
		editEntityRecord(
			'postType',
			postType,
			postId,
			{ template: template.name },
			{ undoIgnore: true }
		);
		let hasPageTemplateClass = false;
		const updatedBodyClasses = bodyClasses.map( className => {
			if ( className.startsWith( 'page-template-' )) {
				hasPageTemplateClass = true;
				return `page-template-${ template.name }`;
			}
			return className;
		});
		if ( ! hasPageTemplateClass ) {
			updatedBodyClasses.push( `page-template-${ template.name }` );
		}
		updateEditorSettings( { bodyClasses: updatedBodyClasses } );
		setShowModal( false ); // Close the template suggestions modal first.
		onClick();
	};
	return (
		<>
			<MenuItem onClick={ () => setShowModal( true ) }>
				{ __( 'Swap template' ) }
			</MenuItem>
			{ showModal && (
				<Modal
					title={ __( 'Choose a template' ) }
					onRequestClose={ () => setShowModal( false ) }
					overlayClassName="editor-post-template__swap-template-modal"
					isFullScreen
				>
					<div className="editor-post-template__swap-template-modal-content">
						<TemplatesList
							postType={ postType }
							onSelect={ onTemplateSelect }
						/>
					</div>
				</Modal>
			) }
		</>
	);
}

function TemplatesList( { postType, onSelect } ) {
	const availableTemplates = useAvailableTemplates( postType );
	const templatesAsPatterns = useMemo(
		() =>
			availableTemplates.map( ( template ) => ( {
				name: template.slug,
				blocks: parse( template.content.raw ),
				title: decodeEntities( template.title.rendered ),
				id: template.id,
			} ) ),
		[ availableTemplates ]
	);
	return (
		<BlockPatternsList
			label={ __( 'Templates' ) }
			blockPatterns={ templatesAsPatterns }
			onClickPattern={ onSelect }
		/>
	);
}
