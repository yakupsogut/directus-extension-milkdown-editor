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
		{
			field: 'fontFamily',
			name: 'Font Family',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				note: 'Font used in the editor content.',
				options: {
					choices: [
						{ text: 'System Default', value: '' },
						{ text: 'Inter', value: "'Inter', sans-serif" },
						{ text: 'Roboto', value: "'Roboto', sans-serif" },
						{ text: 'Open Sans', value: "'Open Sans', sans-serif" },
						{ text: 'Lato', value: "'Lato', sans-serif" },
						{ text: 'Nunito', value: "'Nunito', sans-serif" },
						{ text: 'Poppins', value: "'Poppins', sans-serif" },
						{ text: 'Merriweather', value: "'Merriweather', serif" },
						{ text: 'Georgia', value: "Georgia, serif" },
						{ text: 'Monospace', value: "'Fira Code', monospace" },
					],
					allowOther: true,
				},
			},
		},
	],
	types: ['text'],
};
