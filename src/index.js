import InterfaceComponent from './interface.vue';

export default {
	id: 'milkdown-editor',
	name: 'Milkdown Editor',
	icon: 'edit_document',
	description: 'A WYSIWYG editor based on Milkdown.',
	component: InterfaceComponent,
	options: [
		{
			field: 'folder',
			name: 'Image Folder',
			type: 'uuid',
			meta: {
				width: 'half',
				interface: 'system-folder',
				note: 'Folder where images uploaded in the editor will be saved.',
			},
		},
		{
			field: 'editorHeight',
			name: 'Editor Height (px)',
			type: 'integer',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'Fixed height in pixels. Leave empty for unlimited height.',
				options: {
					placeholder: 'e.g. 400',
					min: 100,
				},
			},
		},
	],
	types: ['text'],
};
