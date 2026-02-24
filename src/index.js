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
			name: 'Resim Klasörü',
			type: 'uuid',
			meta: {
				width: 'full',
				interface: 'system-folder',
				note: 'Editöre yüklenen resimlerin kaydedileceği klasör.',
			},
		},
	],
	types: ['text'],
};
